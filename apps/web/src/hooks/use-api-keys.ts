"use client";

import type { InferResponseType } from "hono/client";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** A safe API key row as returned by GET /api/apikeys (never the hash). */
export type ApiKeySummary = InferResponseType<
  typeof api.apikeys.$get,
  200
>["apiKeys"][number];

/**
 * The create response, including the plaintext `key`. Better Auth returns
 * it exactly once at creation — it can never be fetched again.
 */
export type CreatedApiKey = InferResponseType<
  typeof api.apikeys.$post,
  201
>["apiKey"];

const apiKeysQueryKey = ["api-keys"] as const;

/**
 * Fetch the current user's API keys through the typed Hono client.
 *
 * Resolves to `null` when the request is unauthenticated so consumers
 * can render a sign-in state instead of an error (zero-env behavior).
 */
export const useApiKeys = () => {
  return useQuery({
    queryKey: apiKeysQueryKey,
    queryFn: async () => {
      const res = await api.apikeys.$get();
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch API keys");
      const { apiKeys } = await res.json();
      return apiKeys;
    },
    staleTime: 30_000,
  });
};

/**
 * Create an API key. The mutation resolves with the one-time plaintext
 * key — show it to the user immediately; it is not retrievable later.
 */
export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string }): Promise<CreatedApiKey> => {
      const res = await api.apikeys.$post({ json: input });
      if (!res.ok) throw new Error("Failed to create API key");
      const { apiKey } = await res.json();
      return apiKey;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiKeysQueryKey });
    },
  });
};

/** Revoke an API key by ID and refresh the list. */
export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.apikeys[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error("Failed to revoke API key");
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiKeysQueryKey });
    },
  });
};
