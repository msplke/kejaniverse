import { z } from "zod";

export const AddUnitSchema = z.object({
  unitName: z
    .string()
    .min(4, "Unit name must be at least 4 characters long")
    .max(16, "Unit name cannot exceed 16 characters"),
  unitTypeId: z.string().uuid("Invalid unit type ID format"),
  propertyId: z.string().uuid("Invalid property ID format"),
});
