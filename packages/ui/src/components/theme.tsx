"use client";

import type { ComponentProps } from "react";
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

/**
 * One-click light/dark switch. Toggles off the *resolved* theme so a user on
 * "system" flips to the opposite of what they currently see; `useTheme` still
 * exposes `setTheme("system")` for anywhere that wants it back.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
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
