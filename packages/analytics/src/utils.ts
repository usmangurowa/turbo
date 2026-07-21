/**
 * Generic interface for a user object with identification details
 */
export interface IdentityUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

/**
 * Minimal interface for Sentry's setUser API.
 * Compatible with @sentry/browser, @sentry/nextjs, and @sentry/react-native.
 */
export interface SentryUserSetter {
  setUser: (
    user: { id: string; email?: string; username?: string } | null,
  ) => void;
}

/**
 * Minimal interface for PostHog's identify API.
 * Compatible with posthog-js and posthog-react-native.
 */
export interface PostHogIdentifier {
  identify: (userId: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
}

/**
 * Synchronize user identity with both Sentry and PostHog.
 * Handles identifying on login and clearing on logout.
 *
 * @param user The current authenticated user (or null/undefined if not logged in)
 * @param currentIdentifiedId The ID of the currently identified user in local state
 * @param sentry The Sentry client instance (must have setUser method)
 * @param posthog The PostHog client instance (must have identify and reset methods)
 * @returns The new identified user ID (or null if cleared) to update local state
 *
 * @example
 * ```ts
 * import * as Sentry from "@sentry/nextjs";
 * import posthog from "posthog-js";
 *
 * const newId = syncUserIdentity(session.user, currentId, Sentry, posthog);
 * if (newId !== currentId) setCurrentId(newId);
 * ```
 */
export const syncUserIdentity = (
  user: IdentityUser | null | undefined,
  currentIdentifiedId: string | null,
  sentry: SentryUserSetter,
  posthog: PostHogIdentifier,
): string | null => {
  try {
    if (user && currentIdentifiedId !== user.id) {
      // Identify with Sentry
      sentry.setUser({
        id: user.id,
        email: user.email ?? undefined,
        username: user.name ?? undefined,
      });

      // Identify with PostHog
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
      });

      return user.id;
    }

    if (!user && currentIdentifiedId) {
      // Clear on logout
      sentry.setUser(null);
      posthog.reset();
      return null;
    }

    return currentIdentifiedId;
  } catch (error) {
    // Log error but don't throw - analytics failures shouldn't break auth flows
    console.error("[Analytics] Failed to sync user identity:", error);
    return currentIdentifiedId;
  }
};
