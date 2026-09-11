"use client";

import Link from "next/link";

import { Button } from "@turbo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@turbo/ui/components/empty";
import { cn } from "@turbo/ui/lib/utils";

/** Error state for dashboard queries — the sign-in link covers expired sessions. */
export const QueryError = ({
  title,
  onRetry,
  framed = true,
  className,
}: {
  title: string;
  onRetry: () => void;
  /** Dashed frame around the state. Turn off when the parent card already has one. */
  framed?: boolean;
  /** Extra classes for the state, e.g. a top divider inside a card. */
  className?: string;
}) => (
  <Empty
    data-slot="query-error"
    className={cn(
      "flex-1",
      framed && "rounded-2xl border border-dashed",
      className,
    )}
  >
    <EmptyHeader>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>
        Check your connection, or sign in again if your session expired.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
        <Button size="sm" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </EmptyContent>
  </Empty>
);
