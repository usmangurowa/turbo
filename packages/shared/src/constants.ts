/**
 * Shared constants for Turbo
 * These values are used across the extension, API, and web app
 */

// =============================================================================
// Session & Activity Constants
// =============================================================================

/**
 * Session status values for the coding session lifecycle.
 * ongoing → synced → completed
 */
export const SESSION_STATUS = {
  /** Actively receiving heartbeats */
  ONGOING: "ongoing",
  /** Stats computed, awaiting AI summary */
  SYNCED: "synced",
  /** Has AI-generated title & summary */
  COMPLETED: "completed",
} as const;

/**
 * Session status type for type safety.
 */
export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

/**
 * Session gap threshold in milliseconds.
 * If no activity for this duration, the session is considered ended.
 */
export const SESSION_GAP_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Flow detection threshold in milliseconds.
 * User must have continuous activity for this duration to be "in flow".
 */
export const FLOW_THRESHOLD_MS = 20 * 60 * 1000; // 20 minutes

/**
 * Maximum gap between heartbeats while maintaining flow state.
 * Gaps larger than this break the flow.
 * Set to 5 minutes to allow for brief thinking breaks, coffee runs, etc.
 */
export const FLOW_GAP_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Default keystroke timeout in seconds (matches wakatime default).
 * - Gaps within this threshold: count full gap as coding time
 * - Gaps exceeding this threshold: credit the timeout value (not zero)
 *
 * This is the default value. Users can configure their own timeout
 * via settings (1-30 minutes range).
 *
 * @see https://wakatime.com/faq#timeout
 */
export const KEYSTROKE_TIMEOUT_SECONDS = 15 * 60; // 15 minutes (matches wakatime default)

// =============================================================================
// Sync & Rate Limiting Constants
// =============================================================================

/**
 * Heartbeat sync interval in milliseconds.
 * How often the extension syncs queued heartbeats to the server.
 */
export const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Maximum heartbeats to send in a single sync batch.
 */
export const SYNC_BATCH_SIZE = 50;

/**
 * Maximum queue size before oldest heartbeats are dropped.
 */
export const MAX_QUEUE_SIZE = 1000;

/**
 * API rate limit - requests per window.
 */
export const RATE_LIMIT_MAX_REQUESTS = 100;

/**
 * API rate limit window in milliseconds.
 */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// =============================================================================
// Persistence Constants
// =============================================================================

/**
 * How often to persist metrics to storage (in milliseconds).
 */
export const PERSIST_INTERVAL_MS = 30 * 1000; // 30 seconds

// =============================================================================
// wakatime-compatible Heartbeat Constants
// =============================================================================

/**
 * Time between heartbeats to the same file (wakatime default).
 * Only send a new heartbeat if this time has passed since the last one,
 * OR if the file changed, OR if debug/compile state changed, OR on file save.
 * This replaces simple debouncing with wakatime's conditional heartbeat logic.
 * @see https://github.com/wakatime/vscode-wakatime/blob/master/src/constants.ts
 */
export const TIME_BETWEEN_HEARTBEATS_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Deduplication window for same file + cursor position.
 * Skip heartbeats if same file and exact same position within this window.
 * @see https://github.com/wakatime/vscode-wakatime/blob/master/src/wakatime.ts
 */
export const DEDUPE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Activity category values for heartbeats.
 * Use these constants for comparisons to ensure consistency.
 */
export const HEARTBEAT_CATEGORY = {
  DEBUGGING: "debugging",
  BUILDING: "building",
  CODE_REVIEWING: "code_reviewing",
  COMMITTING: "committing",
} as const;

/**
 * Activity category type for heartbeats.
 * Derived from HEARTBEAT_CATEGORY for type safety.
 */
export type HeartbeatCategory =
  (typeof HEARTBEAT_CATEGORY)[keyof typeof HEARTBEAT_CATEGORY];

// =============================================================================
// Action Tag Constants
// =============================================================================

/**
 * Action tag values for coding sessions.
 * These represent the primary activity type during a session.
 */
export const ACTION_TAG_CONFIG = {
  building: { label: "Building" },
  debugging: { label: "Debugging" },
  refactoring: { label: "Refactoring" },
  testing: { label: "Testing" },
  reviewing: { label: "Reviewing" },
  configuring: { label: "Configuring" },
} as const;

/**
 * Action tag type for type safety.
 */
export type ActionTag = keyof typeof ACTION_TAG_CONFIG;

// =============================================================================
// Editor Constants
// =============================================================================

/**
 * Known code editors that we track for connected editors display.
 * Add new editors here as they become supported.
 */
export const KNOWN_EDITORS = [
  "vscode",
  "cursor",
  "antigravity",
  "windsurf",
  "vim",
  "neovim",
  "emacs",
  "jetbrains",
  "sublime",
  "atom",
] as const;

/**
 * Known editor type for type safety.
 */
export type KnownEditor = (typeof KNOWN_EDITORS)[number];
