import { z } from "zod";
import { zfd } from "zod-form-data";

import { getUnitById } from "~/server/actions/units";
import { unit } from "~/server/db/schema";

export const formDataSchema = zfd.formData({
  sessionId: zfd.text(),
  serviceCode: zfd.text(),
  phoneNumber: zfd.text(),
  text: z.string(),
});

export const chargeApiRequestSchema = z.object({
  // Take into account subunits for the amount validation
  // thus allow a minimum of 100 and a maximum of 15,000,000
  // which is equivalent to KES 1 and KES 150,000
  // respectively
  // Paystack parses the amount in subunits, so we multiply by 100
  amount: z.number().min(100).max(15_000_000).positive(),
  email: z.string().email(),
  mobile_money: z.object({
    phone: z.string().regex(/\+254\d{9}/),
    provider: z.literal("mpesa"),
  }),
});

export type ChargeApiRequest = z.infer<typeof chargeApiRequestSchema>;

type UssdInputValidationResult = {
  status: "valid" | "invalid";
  message?: string;
};

export async function validateUnitId(
  unitId: string,
): Promise<UssdInputValidationResult> {
  if (unitId.length !== 6) {
    return {
      status: "invalid",
      message: `END The unit identifier should be 6 characters long. Please try again.`,
    };
  }
  try {
    await getUnitById(unitId);
  } catch (error) {
    console.error(error);
    // Check if this is the expected "Unit not found" error
    if (error instanceof Error && error.message === "Unit not found") {
      return {
        status: "invalid",
        message: "END Unit not found. Please try again.",
      };
    }
    // Log unexpected errors
    console.error("Unexpected error validating unit name:", error);
    return {
      status: "invalid",
      message: "END Something went wrong. Please try again later.",
    };
  }
  return {
    status: "valid",
  };
}

export function validateAmount(amount: string): UssdInputValidationResult {
  // Validate that the amount is a number, and is between 1 and 150,000 as per
  // M-Pesa limits for Paystack
  const validation = z.coerce
    .number()
    .positive()
    .min(1)
    .max(150_000)
    .safeParse(amount);
  if (!validation.success) {
    return {
      status: "invalid",
      message: `END Invalid amount: ${amount}. The amount must be between KES 1 and KES 150,000.\nPlease try again.`,
    };
  }

  return {
    status: "valid",
  };
}

export function validatePhoneNumber(
  phoneNumber: string,
): UssdInputValidationResult {
  // Validate that the phone number is in the correct format
  const phoneNumberRegex = /^\+254\d{9}$/;
  if (!phoneNumberRegex.test(phoneNumber)) {
    return {
      status: "invalid",
      message: `END Invalid phone number: ${phoneNumber}. Please try again.`,
    };
  }

  return {
    status: "valid",
  };
}

export function validateChargeApiRequestData(
  data: ChargeApiRequest,
): UssdInputValidationResult {
  const validation = chargeApiRequestSchema.safeParse(data);
  if (!validation.success) {
    console.log("Invalid charge API request data", validation.error.format());

    return {
      status: "invalid",
      message: `END Transaction failed. Please try again.`,
    };
  }

  return {
    status: "valid",
  };
}
