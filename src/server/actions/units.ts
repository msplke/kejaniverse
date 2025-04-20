"use server";

import "server-only";

import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import { db } from "~/server/db";
import { unit, unitType } from "~/server/db/schema";

const genUniqueId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6);

export async function getUnitTypes(propertyId: string) {
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
  let id;
  do {
    id = genUniqueId();
  } while (
    (await db.select().from(unit).where(eq(unit.id, id)).limit(1)).length > 0
  );

  const result = await db
    .insert(unit)
    .values({
      id,
      unitName,
      unitTypeId,
      propertyId,
    })
    .returning({ id: unit.id });

  return result;
}

export async function getUnits(propertyId: string) {
  const units = await db
    .select({
      id: unit.id,
      name: unit.unitName,
      rentPrice: unitType.rentPrice,
      occupied: unit.occupied,
      unitType: unitType.unitType,
    })
    .from(unit)
    .leftJoin(unitType, eq(unit.unitTypeId, unitType.id))
    .where(eq(unit.propertyId, propertyId))
    .orderBy(unit.unitName);

  return units;
}
/** Gets a unit with the given unit name */
export async function getUnitbyName(name: string) {
  const results = await db
    .select()
    .from(unit)
    .where(eq(unit.unitName, name))
    .limit(1);

  if (results.length === 0) {
    throw new Error("Unit not found");
  }

  return results[0];
}
