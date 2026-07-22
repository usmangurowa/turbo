"use client";

import Link from "next/link";
import { TurboLogo } from "@/components/turbo-logo";
import { useSession } from "@/hooks/use-session";

import { Button } from "@turbo/ui/components/button";
import { ThemeToggle } from "@turbo/ui/components/theme";

export const LandingNav = () => {
  const { data: session, isPending } = useSession();

  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <TurboLogo size="sm" className="text-primary" />
          <span className="text-sm font-semibold">Turbo</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isPending ? null : session ? (
            <Button size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/create-account">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
