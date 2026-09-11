"use client";

import type { ComponentProps } from "react";
import { useSyncExternalStore } from "react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

import { Button } from "@turbo/ui/components/button";

export { useTheme };

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

// A store that never changes: subscribers are never notified, so the only
// re-render is React's own switch from the server snapshot to the client one.
const subscribeToNothing = () => () => undefined;

/** `false` on the server and during hydration, `true` after mount — no state, no effect, no markup mismatch. */
const useMounted = () =>
  useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

/**
 * One-click light/dark switch. Toggles off the *resolved* theme so a user on
 * "system" flips to the opposite of what they currently see; `useTheme` still
 * exposes `setTheme("system")` for anywhere that wants it back.
 *
 * `next-themes` returns `resolvedTheme` as `undefined` on the server, so the
 * direction is decided only once mounted; until then the control carries a
 * neutral label and the click is a no-op instead of a wrong `setTheme`.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const next =
    mounted && resolvedTheme
      ? resolvedTheme === "dark"
        ? "light"
        : "dark"
      : undefined;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={next ? `Switch to ${next} mode` : "Toggle theme"}
      onClick={() => {
        if (next) setTheme(next);
      }}
    >
      <HugeiconsIcon
        icon={Sun03Icon}
        strokeWidth={1.5}
        className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
      />
      <HugeiconsIcon
        icon={Moon02Icon}
        strokeWidth={1.5}
        className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
      />
    </Button>
  );
}
