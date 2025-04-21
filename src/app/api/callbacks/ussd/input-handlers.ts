import { env } from "process";

import {
  validateAmount,
  validateChargeApiRequestData,
  validatePhoneNumber,
  validateUnitId,
  type ChargeApiRequest,
} from "~/app/api/callbacks/ussd/input-validators";
import { getTenantByUnitId } from "~/server/actions/tenants";
import { getPropertyByUnitId } from "~/server/actions/units";

/**
 * @returns Welcome text with prompt to enter unit identifier.
 */
export function welcome(): string {
  return "CON Kejaniverse Rent Payment\nEnter the unit identifier";
}

/**
 * Validates `unitId` returns a prompt to enter the amount.
 * If `unitId` invalid, it returns an error message.
 */
export async function handleUnitId(unitId: string) {
  const validationResult = await validateUnitId(unitId);
  if (validationResult.status === "invalid") {
    return validationResult.message!;
  }

  return "CON Enter the amount you want to pay.";
}

/**
 * Validates the amount and returns a prompt to enter the phone number.
 * If the amount is invalid, it returns an error message.
 */
export function handleAmount(amount: string) {
  const validationResult = validateAmount(amount);
  if (validationResult.status === "invalid") {
    return validationResult.message!;
  }

  return "CON Enter the M-Pesa number you want to pay with e.g. +254712345678";
}

/**
 * Validates the phone number and returns a confirmation prompt.
 * If the phone number is invalid, it returns an error message.
 */
export function handlePhoneNumber(
  phoneNumber: string,
  unitId: string,
  amount: string,
) {
  const validationResult = validatePhoneNumber(phoneNumber);
  if (validationResult.status === "invalid") {
    return validationResult.message!;
  }
  return `CON Do you want to pay KES ${amount} for the unit with the identifier ${unitId}?\n1. Yes\n2. No`;
}

/**
 * Handles the confirmation of the payment and initiates the charge process.
 * If the user chooses to cancel, it returns a cancellation message.
 */
export async function handleConfirmation(
  choice: string,
  unitId: string,
  amount: string,
  phoneNumber: string,
) {
  if (choice === "1") {
    return await chargeUser(unitId, amount, phoneNumber);
  } else {
    return "END Transaction cancelled.";
  }
}

/**
 * Prepares the request and calls the Paystack Charge API to initialize
 * a mobile money (M-Pesa) transaction given the parameters
 *
 * @returns - a Promise that resolves to a string
 *          starting with 'END' used as the parameter
 *          for the response to the Africa's Talking USSD servers.
 *          The string value must end with an 'END' as this should be
 *          the final operation in the USSD session.
 */
export async function chargeUser(
  unitId: string,
  amount: string,
  phoneNumber: string,
): Promise<string> {
  let responseText;
  // Get tenant for the unit
  try {
    const { email: tenantEmail } = await getTenantByUnitId(unitId);
    const { subaccountCode } = await getPropertyByUnitId(unitId);

    const data: ChargeApiRequest = {
      // Paystack parses the amount in subunits, so we multiply by 100
      // after parsing it to an integer
      amount: parseInt(amount, 10) * 100,
      email: tenantEmail,
      mobile_money: {
        phone: phoneNumber,
        provider: "mpesa",
      },
      metadata: {
        unitId,
      },
      subaccount: subaccountCode!,
    };

    const validation = validateChargeApiRequestData(data);
    if (validation.status === "invalid") {
      return validation.message!;
    }

    // The charge request is valid, proceed with the payment

    try {
      const paystackResponse = await fetch("https://api.paystack.co/charge", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.PAYSTACK_LIVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (paystackResponse.status !== 200) {
        console.error(await paystackResponse.json());
        responseText = "END Transaction failed. Please try again later.";
      } else {
        responseText = "END You'll receive an M-Pesa prompt shortly.";
      }
    } catch (error) {
      console.error(error);
      responseText = "END Transaction failed. Please try again later.";
    }
    return responseText;
  } catch (error) {
    console.error(error);
    return "END Something went wrong. Please try again.";
  }
}
