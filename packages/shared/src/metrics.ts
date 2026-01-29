/**
 * Metrics calculation utilities
 *
 * Shared between API (server-side) and a client app (client-side).
 * Uses wakatime's algorithm for calculating coding time.
 *
 * @see https://wakatime.com/faq#timeout
 */

import {
  FLOW_GAP_MS,
  FLOW_THRESHOLD_MS,
  KEYSTROKE_TIMEOUT_SECONDS,
} from "./constants";

/**
 * Interface for heartbeats used in metrics calculation.
 * Supports both Date objects (API) and ISO strings (client app).
 */
export interface HeartbeatForMetrics {
  timestamp: Date | string;
}

export interface MetricsResult {
  heartbeats: number;
  codingTimeSeconds: number;
  sessions: number;
  flows: number;
  /** Total time spent in flow states (20+ min uninterrupted blocks) */
  flowTimeSeconds: number;
}

/**
 * Convert timestamp to milliseconds, handling both Date and string formats.
 * @throws Error if timestamp is an invalid date string
 */
const toMs = (timestamp: Date | string): number => {
  if (timestamp instanceof Date) {
    const ms = timestamp.getTime();
    if (Number.isNaN(ms)) {
      throw new Error("Invalid Date object");
    }
    return ms;
  }

  const ms = new Date(timestamp).getTime();
  if (Number.isNaN(ms)) {
    throw new Error(`Invalid timestamp string: ${timestamp}`);
  }
  return ms;
};

// =============================================================================
// LOGIC HELPERS
// =============================================================================

interface FlowState {
  currentFlowStart: number | null;
  currentFlowLast: number | null;
  count: number;
  /** Accumulated flow time in milliseconds */
  accumulatedFlowMs: number;
}

/** Helper to update flow state based on new heartbeat */
const updateFlowState = (
  currMs: number,
  lastMs: number | null,
  state: FlowState,
): void => {
  // Check if this heartbeat starts a new flow period (first heartbeat or after a break)
  if (
    state.currentFlowLast === null ||
    currMs - state.currentFlowLast > FLOW_GAP_MS
  ) {
    // Before starting a new period, check if the previous period was a valid flow state
    if (
      state.currentFlowStart !== null &&
      state.currentFlowLast !== null &&
      state.currentFlowLast - state.currentFlowStart >= FLOW_THRESHOLD_MS
    ) {
      state.count++;
      // Accumulate the flow duration
      state.accumulatedFlowMs += state.currentFlowLast - state.currentFlowStart;
    }
    // Start tracking a new flow period
    state.currentFlowStart = currMs;
  }
  // Update the last heartbeat time to track continuous activity
  state.currentFlowLast = currMs;
};

/** Helper to finalize flow count and time at the end */
const finalizeFlows = (state: FlowState): { count: number; timeMs: number } => {
  let finalCount = state.count;
  let finalTimeMs = state.accumulatedFlowMs;

  // Check if current period qualifies as a flow
  if (
    state.currentFlowStart !== null &&
    state.currentFlowLast !== null &&
    state.currentFlowLast - state.currentFlowStart >= FLOW_THRESHOLD_MS
  ) {
    finalCount++;
    finalTimeMs += state.currentFlowLast - state.currentFlowStart;
  }

  return { count: finalCount, timeMs: finalTimeMs };
};

/**
 * Options for metrics calculation
 */
export interface MetricsOptions {
  /**
   * Keystroke timeout in seconds (optional).
   * If not provided, uses the default KEYSTROKE_TIMEOUT_SECONDS (15 min).
   */
  keystrokeTimeoutSeconds?: number;
}

/**
 * Calculate all metrics in a SINGLE PASS (O(N)).
 *
 * This is the most efficient way to process heartbeats as it avoids iterating
 * the array multiple times.
 *
 * @param heartbeats - Array of heartbeats to calculate metrics from
 * @param options - Optional configuration (e.g., user's custom keystroke timeout)
 */
export const calculateAllMetrics = (
  heartbeats: HeartbeatForMetrics[],
  options?: MetricsOptions,
): MetricsResult => {
  if (heartbeats.length === 0) {
    return {
      heartbeats: 0,
      codingTimeSeconds: 0,
      sessions: 0,
      flows: 0,
      flowTimeSeconds: 0,
    };
  }

  // Use custom timeout or fall back to default
  const timeoutSeconds =
    options?.keystrokeTimeoutSeconds ?? KEYSTROKE_TIMEOUT_SECONDS;
  const timeoutMs = timeoutSeconds * 1000;

  // Local helper using the user's configured timeout
  // Matches Wakatime's algorithm: https://gist.github.com/alanhamlett/0d0c496fe40d977dbdbf0abf0b34ec57
  // - If gap is within timeout: count the full gap as coding time
  // - If gap exceeds timeout: count 0 (user was idle/AFK)
  const getCodingTime = (gapMs: number): number => {
    if (gapMs <= timeoutMs) {
      return gapMs / 1000;
    }
    return 0;
  };

  // 1. Sort heartbeats chronologically to ensure correct calculation order
  // Note: Array.sort mutates, so we slice first to be safe
  const sortedHeartbeats = heartbeats.slice().sort((a, b) => {
    return toMs(a.timestamp) - toMs(b.timestamp);
  });

  // Initial state
  let codingTimeSeconds = 0;
  let sessions = 1; // Start with 1 session
  const flowState: FlowState = {
    currentFlowStart: null,
    currentFlowLast: null,
    count: 0,
    accumulatedFlowMs: 0,
  };

  const firstHb = sortedHeartbeats[0];
  if (!firstHb) {
    // Should be unreachable due to check above, but safe
    return {
      heartbeats: 0,
      codingTimeSeconds: 0,
      sessions: 0,
      flows: 0,
      flowTimeSeconds: 0,
    };
  }
  const firstMs = toMs(firstHb.timestamp);

  // Initialize flow state with first heartbeat
  updateFlowState(firstMs, null, flowState);

  // Single Loop
  for (let i = 1; i < sortedHeartbeats.length; i++) {
    const prevHb = sortedHeartbeats[i - 1];
    const currHb = sortedHeartbeats[i];

    if (!prevHb || !currHb) continue;

    const prevMs = toMs(prevHb.timestamp);
    const currMs = toMs(currHb.timestamp);
    const gapMs = currMs - prevMs;

    // 1. Coding Time (uses user's configured timeout)
    codingTimeSeconds += getCodingTime(gapMs);

    // 2. Sessions
    // Use the same timeout for session boundaries
    if (gapMs > timeoutMs) {
      sessions++;
    }

    // 3. Flows
    updateFlowState(currMs, prevMs, flowState);
  }

  const flowResult = finalizeFlows(flowState);

  return {
    heartbeats: heartbeats.length,
    codingTimeSeconds: codingTimeSeconds,
    sessions: sessions,
    flows: flowResult.count,
    flowTimeSeconds: Math.round(flowResult.timeMs / 1000),
  };
};

// Legacy standalone functions wrapping the single-pass logic or helpers
// (kept if needed for individual calculations, but reusing helpers ensures consistency)

export const calculateCodingTimeSeconds = (
  heartbeats: HeartbeatForMetrics[],
): number => {
  return calculateAllMetrics(heartbeats).codingTimeSeconds;
};

export const calculateSessions = (
  heartbeats: HeartbeatForMetrics[],
): number => {
  return calculateAllMetrics(heartbeats).sessions;
};

export const calculateFlows = (heartbeats: HeartbeatForMetrics[]): number => {
  return calculateAllMetrics(heartbeats).flows;
};
