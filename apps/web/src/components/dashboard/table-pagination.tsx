"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@turbo/ui/components/pagination";
import { cn } from "@turbo/ui/lib/utils";

export interface TablePaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * State-driven Previous / "Page x of y" / Next footer for offset-paginated
 * tables. Composes the shadcn `Pagination` primitives; the anchors keep
 * `href="#"` and prevent default, which is the documented pattern for
 * client-side paging. Bound anchors carry `aria-disabled`. Both `page` and
 * `pageCount` are clamped, so a stale or URL-derived page (`0`, `4 of 3`,
 * `NaN`, `Infinity`) still renders a valid label and emits only in-range
 * page changes.
 */
export const TablePagination = ({
  page,
  pageCount,
  onPageChange,
  className,
}: TablePaginationProps) => {
  const safeCount = Number.isFinite(pageCount)
    ? Math.max(1, Math.trunc(pageCount))
    : 1;
  const current = Number.isFinite(page)
    ? Math.min(Math.max(1, Math.trunc(page)), safeCount)
    : 1;
  const atStart = current <= 1;
  const atEnd = current >= safeCount;

  return (
    <Pagination
      data-slot="table-pagination"
      className={cn("justify-between", className)}
    >
      <PaginationContent className="w-full justify-between">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            size="sm"
            aria-disabled={atStart}
            tabIndex={atStart ? -1 : undefined}
            className={cn(atStart && "pointer-events-none opacity-50")}
            onClick={(event) => {
              event.preventDefault();
              if (!atStart) onPageChange(current - 1);
            }}
          />
        </PaginationItem>
        <PaginationItem>
          <span className="text-muted-foreground text-xs tabular-nums">
            Page {current} of {safeCount}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href="#"
            size="sm"
            aria-disabled={atEnd}
            tabIndex={atEnd ? -1 : undefined}
            className={cn(atEnd && "pointer-events-none opacity-50")}
            onClick={(event) => {
              event.preventDefault();
              if (!atEnd) onPageChange(current + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
