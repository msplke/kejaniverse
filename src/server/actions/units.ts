"use server";

import "server-only";

import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import { db } from "~/server/db";
import { property, unit, unitType } from "~/server/db/schema";

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

export async function getUnitById(unitId: string) {
  const results = await db
    .select()
    .from(unit)
    .where(eq(unit.id, unitId))
    .limit(1);

  if (results.length === 0) {
    throw new Error("Unit not found");
  }

  return results[0]!;
}

export async function getPropertyByUnitId(unitId: string) {
  const results = await db
    .select({ property })
    .from(unit)
    .leftJoin(property, eq(unit.propertyId, property.id))
    .where(eq(unit.id, unitId))
    .limit(1);
  const current = results[0]?.property;
  if (!current) {
    throw new Error("Unit or property not found");
  }

  return current;
}

export async function addUnitsGivenRange(
  start: number,
  end: number,
  unitTypeId: string,
  propertyId: string,
) {
  // Check if any units in the range already exist
  const existingUnits = await db
    .select()
    .from(unit)
    .where(eq(unit.propertyId, propertyId));

  const existingUnitNames = new Set(existingUnits.map((u) => u.unitName));

  for (let i = start; i <= end; i++) {
    if (existingUnitNames.has(`${i}`)) {
      throw new Error(`Unit ${i} already exists in this property`);
    }
  }

  // If no conflicts, proceed with insertion
  const units = [];
  for (let i = start; i <= end; i++) {
    const id = genUniqueId();
    units.push({ id, unitName: `${i}`, unitTypeId, propertyId });
  }

  const result = await db.insert(unit).values(units).returning({ id: unit.id });
  if (result.length === 0) {
    throw new Error("Failed to create units");
  }
  return result.length;
}
