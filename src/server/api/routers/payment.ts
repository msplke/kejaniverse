import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { payment, property, tenant, unit, unitType } from "~/server/db/schema";

export const paymentRouter = createTRPCRouter({
  getAllPropertyPayments: protectedProcedure
    .input(z.object({ propertyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.auth;

      try {
        const propertyExists = await ctx.db
          .select({ id: property.id })
          .from(property)
          .where(
            and(
              eq(property.id, input.propertyId),
              eq(property.ownerId, userId),
            ),
          )
          .limit(1);

        if (!propertyExists.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Property not found or you don't have access to it",
          });
        }

        const payments = await ctx.db
          .select({
            unitName: unit.unitName,
            unitId: unit.id,
            rentAmount: unitType.rentPrice,
            tenant: {
              id: tenant.id,
              firstName: tenant.firstName,
              lastName: tenant.lastName,
              email: tenant.email,
              phoneNumber: tenant.phoneNumber,
            },
            paidAt: payment.paidAt,
            referenceNumber: payment.referenceNumber,
            amountPaid: payment.amount,
            paymentMethod: payment.paymentMethod,
          })
          .from(payment)
          .innerJoin(unit, eq(payment.unitId, unit.id))
          .innerJoin(unitType, eq(unit.unitTypeId, unitType.id))
          .innerJoin(property, eq(unit.propertyId, property.id))
          .leftJoin(tenant, eq(payment.tenantId, tenant.id))
          .where(
            and(
              eq(property.id, input.propertyId),
              eq(property.ownerId, userId),
            ),
          );

        if (!payments.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No payments found for this property",
          });
        }

        return payments;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        // Log the error for debugging (you should use your logging solution)
        console.error("Payment query error:", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while fetching payments",
        });
      }
    }),
});
