import { z } from "zod";

const kenyanPhoneNumberRegex = /^(?:\+254|0)?(7\d{8}|1\d{8})$/;

export const AddTenantFormSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phoneNumber: z.string().regex(kenyanPhoneNumberRegex, {
    message: "Invalid Kenyan phone number format",
  }),
  email: z.string().email().min(2).max(50),
  unitId: z.string().min(2).max(50),
});

export type AddTenantFormPayload = z.infer<typeof AddTenantFormSchema>;
