"use server";

import "server-only";

import { eq } from "drizzle-orm";

import { type AddTenantFormData } from "~/components/forms/add-tenant-form";
import { db } from "~/server/db";
import { tenant, unit } from "~/server/db/schema";

export async function getTenants(propertyId: string) {
  const tenants = await db
    .select()
    .from(tenant)
    .innerJoin(unit, eq(unit.id, tenant.unitId))
    .where(eq(unit.propertyId, propertyId));

  return tenants;
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
