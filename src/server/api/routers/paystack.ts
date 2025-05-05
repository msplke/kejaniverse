import { TRPCError } from "@trpc/server";

import { env } from "~/env";
import { type FetchBanksResponse } from "~/lib/validators/paystack";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/** The base URL for the Paystack API */
const BASE_URL = "https://api.paystack.co";

export const paystackRouter = createTRPCRouter({
  fetchBanks: publicProcedure.query(async () => {
    try {
      const res = await fetch(`${BASE_URL}/bank?country=kenya&currency=KES`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        },
      });

      if (!res.ok) {
        const errPayload = (await res.json()) as { message?: string };
        const errMsg = errPayload.message ?? res.statusText;

        // Map HTTP status codes to appropriate TRPC error codes
        switch (res.status) {
          case 401:
          case 403:
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid Paystack API credentials",
            });
          case 404:
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Paystack API endpoint not found",
            });
          case 429:
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: "Rate limit exceeded for Paystack API",
            });
          default:
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Paystack API error: ${errMsg}`,
            });
        }
      }

      const result = (await res.json()) as FetchBanksResponse;

      if (!result.data || !Array.isArray(result.data)) {
        throw new TRPCError({
          code: "PARSE_ERROR",
          message: "Invalid response format from Paystack API",
        });
      }

      return result.data;
    } catch (error) {
      // Re-throw TRPC errors as-is
      if (error instanceof TRPCError) {
        throw error;
      }

      // Handle fetch network errors
      if (error instanceof TypeError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect to Paystack API",
        });
      }

      // Log unexpected errors and throw a generic error
      console.error("Paystack API error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while fetching banks",
      });
    }
  }),
});
