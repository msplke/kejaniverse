import { useMutation, useQuery } from "@tanstack/react-query";

import { type CreateSubaccountPayload } from "~/lib/validators/paystack";
import { createSubaccount, fetchBanks } from "~/server/actions/paystack";

export function useFetchBanks() {
  return useQuery({
    queryKey: ["banks"],
    queryFn: fetchBanks,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3, // retry thrice on failure
  });
}

export function useCreateSubaccount() {
  return useMutation({
    mutationKey: ["create-subaccount"],
    mutationFn: async (input: CreateSubaccountPayload) =>
      createSubaccount(input),
    onError: (error) => {
      console.error("✖ [useCreateSubaccount] Error:", error);
    },
    retry: 3, // retry thrice on failure
  });
}
