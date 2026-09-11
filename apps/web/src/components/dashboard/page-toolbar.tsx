import type * as React from "react";

import { cn } from "@turbo/ui/lib/utils";

/**
 * The 48px bar directly under the sticky header on a section page: scope,
 * sort, and filter controls on the left, the primary action on the right.
 * Height is fixed so the bar lines up across routes — controls inside must be
 * `size="sm"` (h-8) or smaller. Use `wrap` for identity rows (detail pages)
 * whose badges may need a second line at narrow widths.
 */
export const PageToolbar = ({
  className,
  wrap = false,
  ...props
}: React.ComponentProps<"div"> & { wrap?: boolean }) => (
  <div
    data-slot="page-toolbar"
    className={cn(
      "flex shrink-0 items-center justify-between gap-3 border-b px-4 md:px-6",
      wrap ? "min-h-12 flex-wrap py-1.5" : "h-12",
      className,
    )}
    {...props}
  />
);
