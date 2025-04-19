"use server";

import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { type AddTenantFormData } from "~/components/forms/add-tenant-form";
import { type CreatePropertyFormContextType } from "~/components/forms/context";
import { env } from "~/env";
import { db } from "~/server/db";
import { property, tenant, unit, unitType } from "~/server/db/schema";

export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
}

interface ListBanksResponse {
  status: boolean;
  message: string;
  data: Bank[];
}

/**
 * Fetches a list of banks from Paystack for the given country.
 * @param country ISO country code (e.g., 'nigeria', 'ghana', 'kenya', 'south africa')
 * @returns An array of Bank objects
 * @throws Error if the network request fails or Paystack returns a non-OK status
 */
export async function fetchBanks() {
  try {
    const response = await fetch(
      `https://api.paystack.co/bank?country=kenya&currency=KES`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    // The Fetch API only rejects on network errors; non-2xx statuses must be handled manually
    if (!response.ok) {
      throw new Error(`Failed to fetch banks: ${response.statusText}`);
    }

    const result: ListBanksResponse = await response.json();
    return result.data;
  } catch (error: unknown) {
    console.error("✖ [fetchBanks] Failed to fetch banks:", error);
    throw error;
  }
}

export async function createProperty({
  propertyName,
  bankCode,
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
        bankCode,
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

export async function addUnit(
  unitName: string,
  unitTypeId: string,
  propertyId: string,
) {
  const result = await db
    .insert(unit)
    .values({
      unitName,
      unitTypeId,
      propertyId,
    })
    .returning({ id: unit.id });

  return result;
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

export async function getTenantByUnitName(unitName: string) {
  const results = await db
    .select({
      id: tenant.id,
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      phoneNumber: tenant.phoneNumber,
      email: tenant.email,
    })
    .from(tenant)
    .innerJoin(unit, eq(unit.id, tenant.unitId))
    .where(eq(unit.unitName, unitName))
    .limit(1);

  if (results.length === 0) {
    throw new Error("Tenant not found");
  }

  return results[0]!;
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

export async function getTenants(propertyId: string) {
  const tenants = await db
    .select()
    .from(tenant)
    .innerJoin(unit, eq(unit.id, tenant.unitId))
    .where(eq(unit.propertyId, propertyId));

  return tenants;
}

/**
 * Adds a tenant to the db, and marks the unit the tenant is moving into as occupied.
 * @param data information regarding the tenant to be added from the form
 * @returns The id of the added tenant
 */
export async function addTenant(data: AddTenantFormData) {
  const unitExists = await db
    .select()
    .from(unit)
    .where(eq(unit.id, data.unitId))
    .limit(1);
  if (unitExists.length === 0) {
    throw new Error("Unit does not exist");
  }

  const unitOccupied = unitExists[0]?.occupied;
  if (unitOccupied) {
    throw new Error("Unit is already occupied");
  }

  const result = await db.transaction(async (tx) => {
    const addTenantResult = await tx
      .insert(tenant)
      .values({
        unitId: data.unitId,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        email: data.email,
      })
      .returning({ id: tenant.id });

    const tenantId = addTenantResult[0]?.id;

    if (!tenantId) {
      tx.rollback();
      throw new Error("Failed to create tenant");
    }

    await tx
      .update(unit)
      .set({
        occupied: true,
      })
      .where(eq(unit.id, data.unitId));

    return tenantId;
  });

  return result;
}
