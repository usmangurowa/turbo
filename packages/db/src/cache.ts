/**
 * KV Cache utilities stub.
 *
 * This module previously provided Postgres-based caching with TTL support.
 * The cache table has been removed - implement your own caching strategy.
 */

type DbClient = unknown;

/**
 * Stub: Get a cached value by key.
 * @returns Always returns null (cache disabled)
 */
export const cacheGet = <T>(_db: DbClient, _key: string): Promise<T | null> => {
  return Promise.resolve(null);
};

/**
 * Stub: Set a cached value with TTL.
 * @returns No-op (cache disabled)
 */
export const cacheSet = <T>(
  _db: DbClient,
  _key: string,
  _value: T,
  _ttlMs = 3600000,
): Promise<void> => {
  return Promise.resolve();
};

/**
 * Stub: Delete a cached value by key.
 * @returns No-op (cache disabled)
 */
export const cacheDelete = (_db: DbClient, _key: string): Promise<void> => {
  return Promise.resolve();
};

/**
 * Stub: Clean up all expired cache entries.
 * @returns Always returns 0 (cache disabled)
 */
export const cacheCleanup = (_db: DbClient): Promise<number> => {
  return Promise.resolve(0);
};
