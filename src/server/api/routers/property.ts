import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { useCreateSubaccount } from "~/hooks/paystack";
import { type Subaccount } from "~/lib/validators/paystack";
import { CreatePropertyPayloadSchema } from "~/lib/validators/property";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { property, unit, unitType } from "~/server/db/schema";

export const propertyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreatePropertyPayloadSchema)
    .mutation(async ({ ctx, input }) => {
      const { propertyName, bankCode, bankAccountNumber, unitTypes } = input;
      const { userId } = ctx.auth;

      let subaccount: Subaccount;

      const mutation = await useCreateSubaccount();
      await mutation.mutateAsync({
        business_name: propertyName,
        bank_code: bankCode,
        account_number: bankAccountNumber,
        percentage_charge: 1,
      });

      if (mutation.isSuccess && mutation.data) {
        subaccount = mutation.data;
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create subaccount",
        });
      }

      const result = await ctx.db.transaction(async (tx) => {
        const results = await tx
          .insert(property)
          .values({
            name: propertyName,
            bankCode,
            bankAccountNumber,
            subaccountCode: subaccount.subaccount_code,
            ownerId: userId,
          })
          .returning({ id: property.id });

        const propertyId = results[0]?.id;
        if (!propertyId) {
          tx.rollback();
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create property",
          });
        }

        await tx.insert(unitType).values(
          unitTypes.map((ut) => ({
            unitType: ut.unitType,
            rentPrice: ut.rentPrice,
            propertyId,
          })),
        );

        return { propertyId, propertyName };
      });

      return result;
    }),

  getAllUnderOwner: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.auth;

    const properties = await ctx.db
      .select()
      .from(property)
      .where(eq(property.ownerId, userId));

    return properties;
  }),

  getPropertyByUnitId: protectedProcedure
    .input(z.object({ unitId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { unitId } = input;
      const { userId } = ctx.auth;

      const results = await ctx.db
        .select({ property })
        .from(unit)
        .leftJoin(property, eq(unit.propertyId, property.id))
        .where(eq(unit.id, unitId) && eq(property.ownerId, userId))
        .limit(1);

      const result = results[0]?.property;
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }

      return result;
    }),
});
