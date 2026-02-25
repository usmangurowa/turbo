"use client";

import { api } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface ApiKey {
  id: string;
  name: string | null;
  start: string | null;
  enabled?: boolean | null;
  lastRequest?: string | null;
  createdAt?: string;
}

interface ApiKeysResponse {
  keys: ApiKey[];
}

export const API_KEYS_QUERY_KEY = ["api-keys"] as const;

const fetchApiKeys = async (): Promise<ApiKeysResponse> => {
  const res = await api.apikeys.$get();
  if (!res.ok) {
    throw new Error("Failed to fetch API keys");
  }
  return res.json();
};

interface UseApiKeysOptions {
  /**
   * Enable polling at the specified interval (in ms).
   * Pass `false` to disable polling.
   */
  refetchInterval?: number | false;
  /**
   * Whether the query is enabled.
   * @default true
   */
  enabled?: boolean;
  /**
   * The time in milliseconds that the data remains fresh.
   * @default Infinity
   */
  staleTime?: number;
}

/**
 * Hook to fetch and manage API keys.
 *
 * @example
 * ```ts
 * const { keys, isLoading, invalidate } = useApiKeys();
 * ```
 */
export const useApiKeys = (options: UseApiKeysOptions = {}) => {
  const {
    refetchInterval = false,
    enabled = true,
    staleTime = Infinity,
  } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: API_KEYS_QUERY_KEY,
    queryFn: fetchApiKeys,
    refetchInterval,
    enabled,
    staleTime,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY });
  };

  return {
    keys: query.data?.keys ?? [],
    isLoading: query.isLoading,
    error: query.error,
    invalidate,
  };
};
