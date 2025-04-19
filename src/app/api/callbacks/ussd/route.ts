import { env } from "~/env";
import { getTenantByUnitName } from "~/server/actions";
import {
  formDataSchema,
  validateAmount,
  validateChargeApiRequestData,
  validatePhoneNumber,
  validateUnitName,
  type ChargeApiRequest,
} from "./input-validators";

const responseHeaders = {
  "Content-Type": "application/text",
};

export async function POST(req: Request) {
  const validation = formDataSchema.safeParse(await req.formData());
  if (!validation.success) {
    console.error("Invalid form parameters", validation.error.format());
    return new Response("END Something went wrong. Please try again later.", {
      status: 200,
    });
  }

  console.log(validation.data);

  const { text } = validation.data;

  if (text === "") {
    return new Response("CON Kejaniverse Rent Payment\nEnter the unit name", {
      headers: responseHeaders,
    });
  }

  const prevResponses = text.split("*");
  let responseText;

  if (prevResponses.length === 1) {
    const validationResult = await validateUnitName(prevResponses[0]!);
    if (validationResult.status === "invalid") {
      return new Response(validationResult.message, {
        headers: responseHeaders,
      });
    }
    responseText = "CON Enter the amount you want to pay.";
  } else if (prevResponses.length === 2) {
    const validationResult = validateAmount(prevResponses[1]!);
    if (validationResult.status === "invalid") {
      return new Response(validationResult.message, {
        headers: responseHeaders,
      });
    }

    responseText =
      "CON Enter the M-Pesa number you want to pay with e.g. +254712345678";
  } else if (prevResponses.length === 3) {
    const validationResult = validatePhoneNumber(prevResponses[2]!);
    if (validationResult.status === "invalid") {
      return new Response(validationResult.message, {
        headers: responseHeaders,
      });
    }
    // The phone number is valid, ask the user to confirm payment
    const unitName = prevResponses[0];
    const amount = prevResponses[1];
    responseText = `CON Do you want to pay KES ${amount} for unit ${unitName}?\n1. Yes\n2. No`;
  } else if (prevResponses.length === 4) {
    // Validate the user's choice
    if (prevResponses[3] === "1") {
      const unitName = prevResponses[0]!;
      const amount = prevResponses[1]!;
      const phoneNumber = prevResponses[2]!;
      responseText = await chargeUser(unitName, amount, phoneNumber);
    } else {
      responseText = "END Transaction cancelled.";
    }
  }

  return new Response(responseText, {
    headers: responseHeaders,
  });
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
async function chargeUser(
  unitName: string,
  amount: string,
  phoneNumber: string,
): Promise<string> {
  let responseText;
  // Get tenant for the unit
  const tenant = await getTenantByUnitName(unitName);
  if (!tenant) {
    return "END Tenant not found. Please try again.";
  }

  const tenantEmail = tenant.email;
  if (!tenantEmail) {
    return "END Tenant email not found. Please try again.";
  }

  const data: ChargeApiRequest = {
    // Paystack parses the amount in subunits, so we multiply by 100
    // after parsing it to an integer
    amount: parseInt(amount, 10) * 100,
    email: tenantEmail,
    mobile_money: {
      phone: phoneNumber,
      provider: "mpesa",
    },
  };

  const validation = validateChargeApiRequestData(data);
  if (validation.status === "invalid") {
    return validation.message!;
  }

  // The charge request is valid, proceed with the payment
  console.log(data);

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
      console.log(await paystackResponse.json());
      responseText = "END Transaction failed. Please try again later.";
    } else {
      responseText = "END You'll receive an M-Pesa prompt shortly.";
    }
  } catch (error) {
    console.error(error);
    responseText = "END Transaction failed. Please try again later.";
  }

  return responseText;
}
