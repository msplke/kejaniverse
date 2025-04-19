import { z } from "zod";
import { zfd } from "zod-form-data";

import { getUnitbyName } from "~/server/actions";

export const formDataSchema = zfd.formData({
  sessionId: zfd.text(),
  serviceCode: zfd.text(),
  phoneNumber: zfd.text(),
  text: z.string(),
});

export const chargeApiRequestSchema = z.object({
  amount: z.number().positive(),
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

export async function validateUnitName(
  unitName: string,
): Promise<UssdInputValidationResult> {
  try {
    await getUnitbyName(unitName);
  } catch (error) {
    console.error(error);
    return {
      status: "invalid",
      message: "END Unit not found. Please try again.",
    };
  }
  return {
    status: "valid",
  };
}

export function validateAmount(amount: string): UssdInputValidationResult {
  // Validate that the amount is a number
  const validation = z.coerce.number().positive().safeParse(amount);
  if (!validation.success) {
    return {
      status: "invalid",
      message: `END Invalid amount: ${amount}. Please try again.`,
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
