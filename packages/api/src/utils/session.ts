/**
 * Session management utilities stub.
 *
 * This file previously contained session assignment and finalization logic.
 * The actual implementation has been removed as part of the template cleanup.
 */

export type DbClient = unknown;

/**
 * Stub: Assign sessions to heartbeats.
 * Previously handled batch-optimized session assignment for heartbeats.
 */
export const assignSessionsToHeartbeats = <T extends { timestamp: Date }>(
  _db: DbClient,
  _userId: string,
  heartbeats: T[],
  _sessionTimeoutMinutes?: number,
): Promise<string[]> => {
  // Return empty session IDs - implementation removed
  return Promise.resolve(heartbeats.map(() => ""));
};

/**
 * Stub: Finalize a session.
 * Previously calculated stats and triggered AI summary generation.
 */
export const finalizeSession = (
  _db: DbClient,
  _sessionId: string,
  _userId: string,
): Promise<void> => {
  // No-op - implementation removed
  return Promise.resolve();
};
