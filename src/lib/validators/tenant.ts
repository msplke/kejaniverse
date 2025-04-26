import { z } from "zod";

const kenyanPhoneNumberRegex = /^(?:\+254|0)?(7\d{8}|1\d{8})$/;

export const AddTenantFormSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: "First name must be at least 2 characters long",
    })
    .max(16, {
      message: "First name cannot exceed 16 characters",
    }),
  lastName: z
    .string()
    .min(2, {
      message: "Last name must be at least 2 characters long",
    })
    .max(16, {
      message: "Last name cannot exceed 16 characters",
    }),
  phoneNumber: z.string().regex(kenyanPhoneNumberRegex, {
    message: "Invalid Kenyan phone number format",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address",
    })
    .max(64, {
      message: "Email cannot exceed 64 characters",
    }),
  unitId: z.string(),
});

export type AddTenantFormPayload = z.infer<typeof AddTenantFormSchema>;
