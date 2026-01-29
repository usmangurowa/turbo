"use client";

export const SessionsTable = () => null;

/*

import type { ApiCodingSession } from "@/hooks/use-get-sessions";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useDateRange } from "@/hooks/use-date-range";
import { useGetSessions } from "@/hooks/use-get-sessions";
import { useSessionFilters } from "@/hooks/use-session-filters";
import { actionTagConfig } from "@/lib/action-tag-config";
import {
  Add01Icon,
  ArrowRight01Icon,
  Clock01Icon,
  FolderOpenIcon,
  GitBranchIcon,
  Remove01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { formatCodingTime, formatRelativeTime } from "@turbo/shared";
import { Badge } from "@turbo/ui/badge";
import { Button } from "@turbo/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@turbo/ui/empty";
import { Icon } from "@turbo/ui/icon";
import { ScrollArea, ScrollBar } from "@turbo/ui/scroll-area";
import { Skeleton } from "@turbo/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@turbo/ui/table";

import { ActiveSessionIndicator } from "./active-session-indicator";
import { Sparkline } from "./sparkline";

const columns: ColumnDef<ApiCodingSession>[] = [
  {
    accessorKey: "title",
    header: "Session",
    cell: ({ row }) => {
      const isSessionPending =
        row.original.status === "ongoing" || row.original.status === "synced";
      const title = isSessionPending ? "Ongoing Session" : row.original.title;

      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{title}</span>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span>{formatRelativeTime(new Date(row.original.startedAt))}</span>
            <span>•</span>
            <span>{row.original.mainLanguage ?? "Unknown"}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "activity",
    header: "Activity",
    cell: ({ row }) => {
      const isSessionPending =
        row.original.status === "ongoing" || row.original.status === "synced";

      if (isSessionPending || !row.original.activity.length) {
        return <span className="text-muted-foreground text-xs">-</span>;
      }

      return (
        <Sparkline
          "use client";

          export const SessionsTable = () => null;
        ? actionTagConfig[row.original.actionTag]
        : null;

      return (
        <div className="flex items-center gap-2">
          {row.original.linesAdded !== null && row.original.linesAdded > 0 && (
            <Badge
              variant="outline"
              size={"sm"}
              className="gap-1 border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-400"
            >
              <HugeiconsIcon icon={Add01Icon} className="size-3" />
              {row.original.linesAdded}
            </Badge>
          )}
          {row.original.linesDeleted !== null &&
            row.original.linesDeleted > 0 && (
              <Badge
                variant="outline"
                size={"sm"}
                className="gap-1 border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400"
              >
                <HugeiconsIcon icon={Remove01Icon} className="size-3" />
                {row.original.linesDeleted}
              </Badge>
            )}
          {actionTag && (
            <Badge variant="secondary" className="gap-1" size={"sm"}>
              <HugeiconsIcon icon={actionTag.icon} className="size-3" />
              {actionTag.label}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button size="sm" variant="ghost" asChild>
          <Link href={`/dashboard/session/${row.original.id}`}>
            <span>View</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </Link>
        </Button>
      </div>
    ),
  },
];

export const SessionsTable = () => {
  const { startDate, endDate } = useDateRange();
  const { filters } = useSessionFilters();
  const { sessions, isLoading } = useGetSessions({
    mode: "history",
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    filters,
  });

  const table = useReactTable({
    data: sessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <ActiveSessionIndicator />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
          <ScrollArea className="min-h-0 flex-1">
            <Table containerClassName="overflow-visible">
              <TableHeader className="[&_th]:bg-background [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_tr]:border-b">
                <TableRow>
                  {columns.map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {columns.map((_, i) => (
                      <TableCell key={i}>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <ActiveSessionIndicator />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
          <ScrollArea className="min-h-0 flex-1">
            <Table containerClassName="overflow-visible">
              <TableHeader className="[&_th]:bg-background [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_tr]:border-b">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-40 text-center"
                  >
                    <Empty className="border-none">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Icon icon={Clock01Icon} />
                        </EmptyMedia>
                        <EmptyTitle>No sessions found</EmptyTitle>
                        <EmptyDescription className="max-w-sm">
                          Try adjusting your date range or filters to see your
                          coding sessions.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ActiveSessionIndicator />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
        <ScrollArea className="min-h-0 flex-1">
          <Table containerClassName="overflow-visible">
            <TableHeader className="[&_th]:bg-background [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_tr]:border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};
*/
