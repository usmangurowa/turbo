"use client";

export type ApiCodingSession = Record<string, any>;

interface UseGetSessionsOptionsBase {
  enabled?: boolean;
}

interface UseGetSessionsHistoryOptions extends UseGetSessionsOptionsBase {
  mode: "history";
  startDate: string;
  endDate: string;
}

interface UseGetSessionsActiveOptions extends UseGetSessionsOptionsBase {
  mode: "active";
  refetchInterval?: number;
}

export type UseGetSessionsOptions =
  | UseGetSessionsHistoryOptions
  | UseGetSessionsActiveOptions;

export const useGetSessions = (_options: UseGetSessionsOptions) => ({
  sessions: [] as ApiCodingSession[],
  currentSession: null as ApiCodingSession | null,
  isLoading: false,
  isError: false,
  error: null as Error | null,
  refetch: async () => undefined,
});
