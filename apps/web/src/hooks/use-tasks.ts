"use client";

import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

import type { InferResponseType } from "hono/client";

/** A task row as returned by GET /api/tasks */
export type ApiTask = InferResponseType<
  typeof api.tasks.$get
>["tasks"][number];

/**
 * Fetch the most recent tasks through the typed Hono client.
 *
 * The endpoint is public and returns an empty list when the database
 * is unavailable, so consumers can fall back to sample data.
 *
 * @example
 * ```tsx
 * const { data: tasks } = useTasks();
 * const rows = tasks && tasks.length > 0 ? tasks : sampleTasks;
 * ```
 */
export const useTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await api.tasks.$get();
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const { tasks } = await res.json();
      return tasks;
    },
    staleTime: 30_000,
  });
};
