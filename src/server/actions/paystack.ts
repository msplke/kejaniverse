"use server";

import "server-only";

import { env } from "~/env";
import type {
  CreateSubaccountPayload,
  CreateSubaccountResponse,
  FetchBanksResponse,
} from "~/lib/validators/paystack";

/**
 * Fetches a list of banks from Paystack for the given country and currency.
 * @returns An array of Bank objects
 * @throws Error if the network request fails or Paystack returns a non-OK status
 */
export async function fetchBanks() {
  const res = await fetch(
    "https://api.paystack.co/bank?country=kenya&currency=KES",
    {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  // Notify on HTTP-level failures
  if (!res.ok) {
    // Attempt to parse error details
    const errPayload = (await res.json()) as { message?: string };
    const errMsg = errPayload.message ?? res.statusText;
    throw new Error(`Paystack API ${res.status}: ${errMsg}`);
  }

  const result = (await res.json()) as FetchBanksResponse;
  return result.data;
}

/**
 * Creates a subaccount on Paystack.
 * @param input The payload for creating a subaccount
 * @returns The newly created subaccount object
 * @throws Error if the network request fails or Paystack returns a non-OK status
 */
export async function createSubaccount(input: CreateSubaccountPayload) {
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
  return result.data;
}
