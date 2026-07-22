"use client";

import type { ComponentProps } from "react";
import {
  ComputerIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

import { Button } from "@turbo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@turbo/ui/components/dropdown-menu";

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

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
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
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <HugeiconsIcon
            icon={Sun03Icon}
            strokeWidth={1.5}
            data-icon="inline-start"
          />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <HugeiconsIcon
            icon={Moon02Icon}
            strokeWidth={1.5}
            data-icon="inline-start"
          />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <HugeiconsIcon
            icon={ComputerIcon}
            strokeWidth={1.5}
            data-icon="inline-start"
          />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
