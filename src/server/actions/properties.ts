"use server";

import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { type CreatePropertyFormContextType } from "~/components/forms/context";
import { env } from "~/env";
import { db } from "~/server/db";
import { property, unitType } from "~/server/db/schema";

export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  country: string;
  currency: string;
  active: boolean;
  is_deleted: boolean;
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

    if (!response.ok) {
      throw new Error(`Failed to fetch banks: ${response.statusText}`);
    }

    const result = (await response.json()) as ListBanksResponse;
    return result.data;
  } catch (error: unknown) {
    console.error("✖ [fetchBanks] Failed to fetch banks:", error);
    throw error;
  }
}

const CreateSubaccountBodySchema = z.object({
  business_name: z.string(),
  bank_code: z.string(),
  account_number: z.string(),
  percentage_charge: z.number().min(0).max(100),
  description: z.string().optional(),
  primary_contact_name: z.string().optional(),
  primary_contact_email: z.string().email().optional(),
  primary_contact_phone: z.string().optional(),
});

type CreateSubaccountBody = z.infer<typeof CreateSubaccountBodySchema>;

interface Subaccount {
  id: number;
  subaccount_code: string;
  business_name: string;
  description: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  percentage_charge: number;
  settlement_bank: string;
  account_number: string;
  currency: string;
  active: boolean;
  is_verified: boolean;
  settlement_schedule: string;
}

interface CreateSubaccountResponse {
  status: boolean;
  message: string;
  data: Subaccount;
}

/**
 * Create a Paystack subaccount.
 * @param input Validated subaccount payload
 * @returns The newly created subaccount record
 */
export async function createSubaccount(input: CreateSubaccountBody) {
  // Runtime-validate request shape
  const body = CreateSubaccountBodySchema.parse(input);

  try {
    const response = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.PAYSTACK_LIVE_SECRET_KEY}`,
      },
      body: JSON.stringify(body),
    });

    // if (!response.ok) {
    //   throw new Error(`Failed to fetch banks: ${response.statusText}`);
    // }

    // Notify on HTTP-level failures
    if (!response.ok) {
      // Attempt to parse error details
      const errPayload = (await response.json()) as { message?: string };
      const errMsg = errPayload.message ?? response.statusText;
      throw new Error(`Paystack API ${response.status}: ${errMsg}`);
    }

    const result = (await response.json()) as CreateSubaccountResponse;
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

    const subaccount = await createSubaccount({
      business_name: propertyName,
      bank_code: bankCode,
      account_number: bankAccountNumber,
      percentage_charge: 1,
    });

    await tx
      .update(property)
      .set({
        subaccountCode: subaccount.subaccount_code,
      })
      .where(eq(property.id, propertyId));

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
