import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { AddTenantFormSchema } from "~/lib/validators/tenant";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { property, tenant, unit } from "~/server/db/schema";

export const tenantRouter = createTRPCRouter({
  addTenant: protectedProcedure
    .input(AddTenantFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { unitId, firstName, lastName, phoneNumber, email } = input;

      const unitExists = await ctx.db
        .select()
        .from(unit)
        .where(eq(unit.id, unitId))
        .limit(1);

      if (unitExists.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Unit does not exist",
        });
      }

      const unitOccupied = unitExists[0]?.occupied;
      if (unitOccupied) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unit is already occupied",
        });
      }

      const tenantId = await ctx.db.transaction(async (tx) => {
        const addTenantResult = await tx
          .insert(tenant)
          .values({
            unitId,
            firstName,
            lastName,
            phoneNumber,
            email,
          })
          .returning({ id: tenant.id });

        const tenantId = addTenantResult[0]?.id;
        if (!tenantId) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create tenant",
          });
        }

        // Mark the unit as occupied
        await tx
          .update(unit)
          .set({ occupied: true })
          .where(eq(unit.id, unitId));

        return tenantId;
      });

      return tenantId;
    }),

  getAllUnderProperty: protectedProcedure
    .input(z.object({ propertyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { propertyId } = input;
      const { userId } = ctx.auth;

      // Fetch tenants joined with units and property, and check ownership in a single query
      const tenants = await ctx.db
        .select({ tenant })
        .from(tenant)
        .innerJoin(unit, eq(tenant.unitId, unit.id))
        .innerJoin(property, eq(unit.propertyId, property.id))
        .where(and(eq(property.id, propertyId), eq(property.ownerId, userId)));

      if (tenants.length === 0) {
        // Could be not found or not authorized
        // Check if property exists for better error reporting
        const propertyExists = await ctx.db
          .select()
          .from(property)
          .where(eq(property.id, propertyId))
          .limit(1);

        if (!propertyExists[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Property does not exist",
          });
        } else {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You do not have permission to view this property's tenants",
          });
        }
      }

      return tenants;
    }),

  getTenantByUnitId: protectedProcedure
    .input(z.object({ unitId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { unitId } = input;

      const results = await ctx.db
        .select({
          id: tenant.id,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          phoneNumber: tenant.phoneNumber,
          email: tenant.email,
        })
        .from(tenant)
        .innerJoin(unit, eq(unit.id, tenant.unitId))
        .where(eq(unit.id, unitId))
        .limit(1);

      if (results.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }

      return results[0];
    }),
});
