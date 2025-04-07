"use server";

import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { type CreatePropertyFormContextType } from "~/app/(dashboard)/properties/new/context";
import { db } from "~/server/db";
import { property, unit, unitType } from "~/server/db/schema";

export async function createProperty({
  propertyName,
  bankAccountNumber,
  unitTypes,
}: CreatePropertyFormContextType) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const result = await db.transaction(async (tx) => {
    const results = await tx
      .insert(property)
      .values({
        name: propertyName,
        bankAccountNumber,
        ownerId: userId,
      })
      .returning({ id: property.id });

    const propertyId = results[0]?.id;
    if (!propertyId) {
      tx.rollback();
      throw new Error("Failed to create property");
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
}

export async function getUnitTypes(propertyId: string) {
  const unitTypes = await db
    .select()
    .from(unitType)
    .where(eq(unitType.propertyId, propertyId));

  return unitTypes;
}

export async function addUnit(unitName: string, unitTypeId: string) {
  const result = await db
    .insert(unit)
    .values({
      unitName,
      unitTypeId,
    })
    .returning({ id: unit.id });

  return result;
}

export async function getUnits(propertyId: string) {
  const unitTypes = await db
    .select()
    .from(unitType)
    .where(eq(unitType.propertyId, propertyId));

  const currentUnits = [];

  for (const type of unitTypes) {
    const unitData = await db
      .select({
        id: unit.id,
        name: unit.unitName,
        unitType: unitType.unitType,
        rentPrice: unitType.rentPrice,
      })
      .from(unit)
      .innerJoin(unitType, eq(unit.unitTypeId, unitType.id))
      .where(eq(unit.unitTypeId, type.id));

    currentUnits.push(...unitData);
  }

  return currentUnits;
}

/**
 * Get all properties for the authenticated user.
 */
export async function getProperties() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const properties = await db
    .select()
    .from(property)
    .where(eq(property.ownerId, userId));

  return properties;
}
