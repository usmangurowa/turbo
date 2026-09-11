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
 * Titles stay 14px to hold table density (the one typography override lives
 * here, not at call sites). `title` is required so every frame keeps a real
 * `CardHeader`/`CardTitle` in every branch.
 */
export const TableCard = ({
  title,
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
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {description ? (
        <CardDescription className="text-xs">{description}</CardDescription>
      ) : null}
      {action ? <CardAction>{action}</CardAction> : null}
    </CardHeader>
    <CardContent
      className={cn("flex flex-col", padding === "none" ? "px-0" : "px-4 pb-4")}
    >
      {children}
    </CardContent>
    {footer ? (
      <CardFooter className="border-t px-4 pb-3">{footer}</CardFooter>
    ) : null}
  </Card>
);
