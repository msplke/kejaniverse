"use server";

import "server-only";

import { auth } from "@clerk/nextjs/server";
import { desc, eq, sql } from "drizzle-orm";

import { env } from "~/env";
import type {
  CreateSubaccountPayload,
  CreateSubaccountResponse,
  FetchBanksResponse,
} from "~/lib/validators/paystack";
import { type CreatePropertyPayload } from "~/lib/validators/property";
import { db } from "~/server/db";
import { RECENT_PAYMENTS_LIMIT } from "~/server/db/constants";
import { payment, property, tenant, unit, unitType } from "~/server/db/schema";

/**
 * Fetches a list of banks from Paystack for the given country.
 * @param country ISO country code (e.g., 'nigeria', 'ghana', 'kenya', 'south africa')
 * @returns An array of Bank objects
 * @throws Error if the network request fails or Paystack returns a non-OK status
 */
export async function fetchBanks() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const res = await fetch(
      `https://api.paystack.co/bank?country=kenya&currency=KES`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    // Use the abort controller to cancel the request if it takes too long
    clearTimeout(timeoutId);

    // Notify on HTTP-level failures
    if (!res.ok) {
      // Attempt to parse error details
      const errPayload = (await res.json()) as { message?: string };
      const errMsg = errPayload.message ?? res.statusText;
      throw new Error(`Paystack API ${res.status}: ${errMsg}`);
    }

    const result = (await res.json()) as FetchBanksResponse;
    return result.data;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Paystack API request timed out");
    }
    console.error("✖ [fetchBanks] Failed to fetch banks:", error);
    throw error;
  }
}

/**
 * Create a Paystack subaccount.
 * @param input Validated subaccount payload
 * @returns The newly created subaccount record
 */
export async function createSubaccount(input: CreateSubaccountPayload) {
  try {
    const res = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify(input),
    });

    // Notify on HTTP-level failures
    if (!res.ok) {
      // Attempt to parse error details
      const errPayload = (await res.json()) as { message?: string };
      const errMsg = errPayload.message ?? res.statusText;
      throw new Error(`Paystack API ${res.status}: ${errMsg}`);
    }

    const result = (await res.json()) as CreateSubaccountResponse;
    // console.log(result);
    return result.data;
  } catch (error: unknown) {
    console.error("✖ [createSubaccount]: unable to create subaccount", error);
    throw error;
  }
}

export async function createProperty({
  propertyName,
  bankCode,
  bankAccountNumber,
  unitTypes,
}: CreatePropertyPayload) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const subaccount = await createSubaccount({
    business_name: propertyName,
    bank_code: bankCode,
    account_number: bankAccountNumber,
    percentage_charge: 1,
  });
  if (!subaccount) {
    throw new Error("Failed to create subaccount");
  }

  const result = await db.transaction(async (tx) => {
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

export async function getPropertyDashboardData(propertyId: string) {
  // Get recent payments with tenant and unit info
  const recentPayments = await db
    .select({
      referenceNumber: payment.referenceNumber,
      amount: payment.amount,
      paidAt: payment.paidAt,
      paymentMethod: payment.paymentMethod,
      tenantName: sql<string>`concat(${tenant.firstName}, ' ', ${tenant.lastName})`,
      unitName: unit.unitName,
    })
    .from(payment)
    .innerJoin(tenant, eq(payment.tenantId, tenant.id))
    .innerJoin(unit, eq(payment.unitId, unit.id))
    .where(eq(unit.propertyId, propertyId))
    .orderBy(desc(payment.paidAt))
    .limit(RECENT_PAYMENTS_LIMIT);

  // Get total revenue
  const result = await db
    .select({
      totalRevenue: sql<number>`sum(${payment.amount})`,
    })
    .from(payment)
    .innerJoin(unit, eq(payment.unitId, unit.id))
    .where(eq(unit.propertyId, propertyId));

  const totalRevenue = result[0]!.totalRevenue;

  // Get unit statistics
  const [unitStats] = await db
    .select({
      totalUnits: sql<number>`count(*)`,
      occupiedUnits: sql<number>`sum(case when ${unit.occupied} then 1 else 0 end)`,
    })
    .from(unit)
    .where(eq(unit.propertyId, propertyId));

  return {
    recentPayments,
    totalRevenue: totalRevenue ?? 0,
    totalUnits: Number(unitStats?.totalUnits),
    occupiedUnits: Number(unitStats?.occupiedUnits),
  };
}
