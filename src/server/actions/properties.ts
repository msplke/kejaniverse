"use server";

import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { type CreatePropertyFormContextType } from "~/components/forms/context";
import { env } from "~/env";
import { db } from "~/server/db";
import { property, unitType } from "~/server/db/schema";

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
          Authorization: `Bearer ${env.PAYSTACK_TEST_SECRET_KEY}`,
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
