import type { IconSvgElement } from "@hugeicons/react";
import type * as React from "react";
import Link from "next/link";
import { HintLabel } from "@/components/dashboard/hint-label";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@turbo/ui/components/card";
import { Icon } from "@turbo/ui/components/icon";
import { cn } from "@turbo/ui/lib/utils";

export interface StatCardProps {
  label: string;
  /** Explains a non-obvious calculation behind the label (renders `HintLabel`). */
  hint?: string;
  icon?: IconSvgElement;
  iconClassName?: string;
  /** Single element for the header zone's right edge (badge, trend, menu). */
  action?: React.ReactNode;
  value: React.ReactNode;
  /** Small muted line directly under the value (unit, currency, period). */
  valueCaption?: React.ReactNode;
  /** `hero` for the overview pulse row; `compact` for detail stat grids. */
  size?: "hero" | "compact";
  tone?: "success" | "destructive" | "warning";
  /** Mute the value (e.g. a zero) so real numbers dominate the row. */
  dim?: boolean;
  caption?: React.ReactNode;
  captionTone?: "success" | "destructive" | "warning";
  /** Makes the label a stretched link that covers the whole card. */
  href?: string;
  className?: string;
  /** Support zone: sparkline, progress, secondary lines. */
  children?: React.ReactNode;
}

const valueToneClass = {
  success: "text-success",
  destructive: "text-destructive",
  warning: "text-warning",
} as const;

/**
 * House stat card (DESIGN.md → Components → Stat card): dashed frame, muted
 * 12px label, tabular numeral, small muted caption. Composed from `Card` so
 * header / value / support zones follow `.ai/patterns/ui-composition.md`.
 *
 * `href` turns the label into a stretched link: the anchor's `after:` overlay
 * covers the card, while `hint` and `action` stay positioned above it, so a
 * linked card never nests a button inside the anchor. Two consequences:
 * the support zone (`children`, `valueCaption`, `caption`) sits under the
 * overlay, so keep it non-interactive on a linked card; and the overlay
 * relies on `container-type` no longer creating an absolute-positioning
 * containing block (Chrome 129 / Firefox 133 / Safari 18.4 and later — on
 * older engines the click target shrinks to the header, the link still works).
 */
export const StatCard = ({
  label,
  hint,
  icon,
  iconClassName,
  action,
  value,
  valueCaption,
  size = "compact",
  tone,
  dim,
  caption,
  captionTone,
  href,
  className,
  children,
}: StatCardProps) => {
  const labelNode = href ? (
    <Link
      href={href}
      data-slot="stat-card-link"
      className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
    >
      {label}
    </Link>
  ) : (
    label
  );

  return (
    <Card
      variant="dashed"
      size={size === "hero" ? "default" : "sm"}
      data-slot="stat-card"
      data-stat-size={size}
      className={cn(
        size === "hero" ? "gap-3" : "gap-1",
        href &&
          "hover:bg-accent/50 has-[a:focus-visible]:ring-ring/30 relative transition-colors has-[a:focus-visible]:ring-2",
        className,
      )}
    >
      <CardHeader className="gap-0">
        <CardTitle className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
          {icon ? (
            <Icon
              icon={icon}
              className={cn("size-4 shrink-0", iconClassName)}
            />
          ) : null}
          {hint ? (
            <HintLabel label={label} hint={hint}>
              {labelNode}
            </HintLabel>
          ) : (
            labelNode
          )}
        </CardTitle>
        {action ? (
          <CardAction className={cn(href && "relative")}>{action}</CardAction>
        ) : null}
      </CardHeader>
      <CardContent
        className={cn("flex flex-1 flex-col gap-1", size === "hero" && "gap-3")}
      >
        <span
          className={cn(
            "font-medium tracking-tight tabular-nums",
            size === "hero" ? "text-3xl" : "text-xl",
            dim ? "text-muted-foreground/60" : "text-foreground",
            tone && !dim && valueToneClass[tone],
          )}
        >
          {value}
        </span>
        {valueCaption ? (
          <span className="text-muted-foreground text-xs">{valueCaption}</span>
        ) : null}
        {children}
        {caption ? (
          <p
            className={cn(
              "text-muted-foreground text-xs",
              size === "hero" && "mt-auto",
              captionTone && valueToneClass[captionTone],
            )}
          >
            {caption}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};
