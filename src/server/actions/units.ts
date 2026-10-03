"use server";

import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import { db } from "~/server/db";
import { property, unit, unitType } from "~/server/db/schema";

const genUniqueId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6);

/**
 * Verifies that the property exists and belongs to the authenticated user.
 * @throws Error if the user is unauthenticated or does not own the property
 */
async function verifyPropertyOwnership(propertyId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const propertyExists = await db
    .select({ id: property.id })
    .from(property)
    .where(and(eq(property.id, propertyId), eq(property.ownerId, userId)))
    .limit(1);

  if (propertyExists.length === 0) {
    throw new Error("Property not found or you don't have access to it");
  }
}

export async function getUnitTypes(propertyId: string) {
  await verifyPropertyOwnership(propertyId);

  const unitTypes = await db
    .select()
    .from(unitType)
    .where(eq(unitType.propertyId, propertyId));

  return unitTypes;
}

export async function addUnit(
  unitName: string,
  unitTypeId: string,
  propertyId: string,
) {
  await verifyPropertyOwnership(propertyId);

  for (let attempts = 0; attempts < 5; attempts++) {
    const id = genUniqueId();
    try {
      // optimistic insert – break on success
      const result = await db
        .insert(unit)
        .values({ id, unitName, unitTypeId, propertyId })
        .returning({ id: unit.id });
      return result;
    } catch (err: unknown) {
      // retry only on duplicate‑key error
      // https://www.postgresql.org/docs/current/errcodes-appendix.html
      if (!(err as { code?: string }).code?.startsWith("23")) throw err;
    }
  }

  throw new Error("Failed to generate unique unit id");
}

export async function getUnits(propertyId: string) {
  await verifyPropertyOwnership(propertyId);

  const units = await db
    .select({
      id: unit.id,
      name: unit.unitName,
      rentPrice: unitType.rentPrice,
      occupied: unit.occupied,
      unitType: unitType.unitType,
    })
    .from(unit)
    .innerJoin(unitType, eq(unit.unitTypeId, unitType.id))
    .where(eq(unit.propertyId, propertyId))
    .orderBy(unit.unitName);

  return units;
}
/** Gets a unit with the given unit name */
export async function getUnitByName(name: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const results = await db
    .select({ unit })
    .from(unit)
    .innerJoin(property, eq(unit.propertyId, property.id))
    .where(and(eq(unit.unitName, name), eq(property.ownerId, userId)))
    .limit(1);

  if (results.length === 0) {
    throw new Error("Unit not found");
  }

  return results[0]?.unit;
}

export async function getUnitById(unitId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const results = await db
    .select({ unit })
    .from(unit)
    .innerJoin(property, eq(unit.propertyId, property.id))
    .where(and(eq(unit.id, unitId), eq(property.ownerId, userId)))
    .limit(1);

  if (results.length === 0) {
    throw new Error("Unit not found");
  }

  return results[0]!.unit;
}

export async function getPropertyByUnitId(unitId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const results = await db
    .select({ property })
    .from(unit)
    .leftJoin(property, eq(unit.propertyId, property.id))
    .where(and(eq(unit.id, unitId), eq(property.ownerId, userId)))
    .limit(1);
  const current = results[0]?.property;
  if (!current) {
    throw new Error("Unit or property not found");
  }

  return current;
}
