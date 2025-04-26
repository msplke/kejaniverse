import { z } from "zod";

export const AddUnitSchema = z.object({
  unitName: z.string(),
  unitTypeId: z.string(),
  propertyId: z.string(),
});
