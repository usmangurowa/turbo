/**
 * General utility functions used across apps and packages.
 */

/**
 * Get the most frequent item from an array.
 * Returns undefined if the array is empty.
 *
 * @example
 * ```ts
 * getMostFrequent(["a", "b", "a", "c", "a"]); // "a"
 * getMostFrequent([]); // undefined
 * ```
 */
export const getMostFrequent = <T>(arr: T[]): T | undefined => {
  if (arr.length === 0) return undefined;

  const counts = new Map<T, number>();
  for (const item of arr) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }

  let maxCount = 0;
  let mostFrequent: T | undefined;
  for (const [item, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = item;
    }
  }

  return mostFrequent;
};

/**
 * Format a date as a human-readable relative time string.
 * Returns strings like "Just now", "5 mins ago", "2 hours ago", "3 days ago".
 *
 * @example
 * ```ts
 * formatRelativeTime(new Date()); // "Just now"
 * formatRelativeTime(new Date(Date.now() - 5 * 60000)); // "5 mins ago"
 * formatRelativeTime(new Date(Date.now() - 2 * 3600000)); // "2 hours ago"
 * formatRelativeTime(new Date(Date.now() - 3 * 86400000)); // "3 days ago"
 * ```
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};
