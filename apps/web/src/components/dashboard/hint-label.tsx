"use client";

import type * as React from "react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

import { Button } from "@turbo/ui/components/button";
import { Icon } from "@turbo/ui/components/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@turbo/ui/components/tooltip";
import { cn } from "@turbo/ui/lib/utils";

/**
 * A label with a one-line explanation behind a small info icon.
 *
 * Use it where the label hides a calculation or a policy — not on
 * self-evident labels, so hints stay meaningful. `children` overrides the
 * visible label (for example a link) while `label` still names the hint.
 */
export const HintLabel = ({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint: string;
  className?: string;
  children?: React.ReactNode;
}) => (
  <span
    data-slot="hint-label"
    className={cn("inline-flex items-center gap-1", className)}
  >
    {children ?? label}
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`What "${label}" means`}
          // `relative` keeps the button clickable above a stretched card link.
          className="text-muted-foreground/60 hover:text-foreground relative size-4 cursor-help rounded-sm hover:bg-transparent"
        >
          <Icon icon={InformationCircleIcon} className="size-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-60 text-pretty">{hint}</TooltipContent>
    </Tooltip>
  </span>
);
