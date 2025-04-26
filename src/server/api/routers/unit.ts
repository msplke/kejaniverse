import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { z } from "zod";

import { AddUnitSchema } from "~/lib/validators/unit";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { property, unit, unitType } from "~/server/db/schema";

const genUniqueId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6);

export const unitRouter = createTRPCRouter({
  addUnit: protectedProcedure
    .input(AddUnitSchema)
    .mutation(async ({ ctx, input }) => {
      const { unitName, unitTypeId, propertyId } = input;
      const id = genUniqueId();

      const results = await ctx.db
        .insert(unit)
        .values({ id, unitName, unitTypeId, propertyId })
        .returning({ id: unit.id });

      const unitId = results[0]?.id;
      if (!unitId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create unit",
        });
      }

      return unitId;
    }),

  getAllUnderProperty: protectedProcedure
    .input(z.object({ propertyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { propertyId } = input;
      const { userId } = ctx.auth;

      const units = await ctx.db
        .select({
          id: unit.id,
          name: unit.unitName,
          rentPrice: unitType.rentPrice,
          occupied: unit.occupied,
          unitType: unitType.unitType,
        })
        .from(unit)
        .leftJoin(unitType, eq(unit.unitTypeId, unitType.id))
        .innerJoin(property, eq(unit.propertyId, property.id))
        .where(
          eq(unit.propertyId, propertyId) &&
            eq(property.id, propertyId) &&
            eq(property.ownerId, userId),
        )
        .orderBy(unit.unitName);

      if (units.length === 0) {
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
            message: "You do not have permission to view this property's units",
          });
        }
      }

      return units;
    }),

  getUnitById: protectedProcedure
    .input(z.object({ unitId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { unitId } = input;
      const { userId } = ctx.auth;

      const results = await ctx.db
        .select({ unit })
        .from(unit)
        .innerJoin(property, eq(unit.propertyId, property.id))
        .where(
          eq(unit.id, unitId) &&
            eq(unit.propertyId, property.id) &&
            eq(property.ownerId, userId),
        )
        .limit(1);

      if (results.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Unit not found",
        });
      }

      return results[0];
    }),

  getUnitByName: protectedProcedure
    .input(z.object({ unitName: z.string() }))
    .query(async ({ ctx, input }) => {
      const { unitName } = input;
      const { userId } = ctx.auth;

      const results = await ctx.db
        .select({ unit })
        .from(unit)
        .innerJoin(property, eq(unit.propertyId, property.id))
        .where(
          eq(unit.unitName, unitName) &&
            eq(unit.propertyId, property.id) &&
            eq(property.ownerId, userId),
        )
        .limit(1);

      if (results.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Unit not found",
        });
      }

      return results[0];
    }),

  getUnitTypes: protectedProcedure
    .input(z.object({ propertyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { propertyId } = input;
      const { userId } = ctx.auth;

      const unitTypes = await ctx.db
        .select()
        .from(unitType)
        .innerJoin(property, eq(unitType.propertyId, property.id))
        .where(
          eq(unitType.propertyId, propertyId) &&
            eq(property.id, propertyId) &&
            eq(property.ownerId, userId),
        );

      if (unitTypes.length === 0) {
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
              "You do not have permission to view this property's unit types",
          });
        }
      }

      return unitTypes;
    }),
});
