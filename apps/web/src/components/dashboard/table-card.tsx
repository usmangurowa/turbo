import type * as React from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@turbo/ui/components/card";
import { cn } from "@turbo/ui/lib/utils";

export interface TableCardProps {
  title: React.ReactNode;
  /** Heading element for the title so the card stays in the page outline. */
  titleAs?: "h2" | "h3";
  description?: React.ReactNode;
  /** One element for the header's right edge: a button, filters, a count badge. */
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /** Padding for the body. Tables want `none` so rows run edge to edge. */
  padding?: "none" | "sm";
  children: React.ReactNode;
}

/**
 * Dashed-frame container card for tables and lists: `Card variant="dashed"`
 * with the header / body / footer zones from `.ai/patterns/ui-composition.md`.
 * The title uses the `title` role (16px semibold) inside a real heading so
 * table cards and plain section headers share one scale and one outline;
 * `title` is required so every frame keeps a `CardHeader`/`CardTitle`.
 */
export const TableCard = ({
  title,
  titleAs: Heading = "h2",
  description,
  action,
  footer,
  className,
  padding = "none",
  children,
}: TableCardProps) => (
  <Card
    variant="dashed"
    size="sm"
    data-slot="table-card"
    className={cn("gap-0 py-0", className)}
  >
    <CardHeader className="pt-4 pb-3">
      <CardTitle className="text-base font-semibold">
        <Heading>{title}</Heading>
      </CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
      {action ? <CardAction>{action}</CardAction> : null}
    </CardHeader>
    <CardContent
      className={cn("flex flex-col", padding === "none" ? "px-0" : "px-4 pb-4")}
    >
      {children}
    </CardContent>
    {footer ? (
      <CardFooter className="border-t border-dashed px-4 pb-3">
        {footer}
      </CardFooter>
    ) : null}
  </Card>
);
