"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { useSession } from "@/hooks/use-session";
import { TimeScheduleIcon } from "@hugeicons/core-free-icons";

import { Icon } from "@turbo/ui/icon";
import { Skeleton } from "@turbo/ui/skeleton";

export function DashboardNavbar() {
  const { data: sessionData, isPending: isSessionPending } = useSession();

  if (isSessionPending) {
    return (
      <header className="border-border bg-background sticky top-0 z-50 border-b">
        <div className="container flex h-14 items-center justify-between px-4">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </header>
    );
  }

  if (!sessionData) {
    return null;
  }

  return (
    <header className="border-border bg-background sticky top-0 z-50 border-b">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Icon icon={TimeScheduleIcon} className="size-5" />
          <h1 className="text-lg font-semibold">Turbo</h1>
          <Link
            href="/docs"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Setup Guide
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <p>Hello {sessionData.user.name}</p>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
