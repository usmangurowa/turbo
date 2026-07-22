"use client";

import type { IconSvgElement } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import {
  Calendar03Icon,
  FlagIcon,
  StatusIcon,
  Task01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@turbo/ui/components/avatar";
import { Badge } from "@turbo/ui/components/badge";
import { Icon } from "@turbo/ui/components/icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@turbo/ui/components/table";
import { cn } from "@turbo/ui/lib/utils";

type TaskStatus = "completed" | "in-progress" | "escalated";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type TaskSortKey = "date" | "priority" | "status" | "assignee";

export type { TaskPriority, TaskSortKey, TaskStatus };

interface Task {
  id: string;
  title: string;
  date: string;
  day: string;
  month: string;
  tone: "blue" | "orange" | "teal";
  status: TaskStatus;
  priority: TaskPriority;
  assignee: { name: string; avatar?: string };
  group: "today" | "this-week" | "earlier";
}

const tasks: Task[] = [
  {
    id: "TSK-341",
    title: "Review onboarding funnel drop-off",
    date: "2025-01-14",
    day: "14",
    month: "Jan",
    tone: "blue",
    status: "in-progress",
    priority: "urgent",
    assignee: { name: "Amina Yusuf" },
    group: "today",
  },
  {
    id: "TSK-338",
    title: "Ship dark mode contrast fixes",
    date: "2025-01-14",
    day: "14",
    month: "Jan",
    tone: "teal",
    status: "completed",
    priority: "high",
    assignee: { name: "Dele Adeyemi" },
    group: "today",
  },
  {
    id: "TSK-334",
    title: "Escalate billing webhook retries",
    date: "2025-01-13",
    day: "13",
    month: "Jan",
    tone: "orange",
    status: "escalated",
    priority: "urgent",
    assignee: { name: "Sarah Chen" },
    group: "this-week",
  },
  {
    id: "TSK-330",
    title: "Draft Q1 analytics report",
    date: "2025-01-12",
    day: "12",
    month: "Jan",
    tone: "blue",
    status: "in-progress",
    priority: "medium",
    assignee: { name: "Marcus Bell" },
    group: "this-week",
  },
  {
    id: "TSK-327",
    title: "Refine AI assistant prompts",
    date: "2025-01-11",
    day: "11",
    month: "Jan",
    tone: "teal",
    status: "completed",
    priority: "low",
    assignee: { name: "Amina Yusuf" },
    group: "this-week",
  },
  {
    id: "TSK-319",
    title: "Migrate legacy customer exports",
    date: "2025-01-08",
    day: "08",
    month: "Jan",
    tone: "orange",
    status: "completed",
    priority: "medium",
    assignee: { name: "Dele Adeyemi" },
    group: "earlier",
  },
  {
    id: "TSK-311",
    title: "Audit workspace permissions",
    date: "2025-01-06",
    day: "06",
    month: "Jan",
    tone: "blue",
    status: "completed",
    priority: "low",
    assignee: { name: "Sarah Chen" },
    group: "earlier",
  },
];

const groupLabels: Record<Task["group"], string> = {
  today: "Today",
  "this-week": "This Week",
  earlier: "Earlier",
};

const dateTone: Record<Task["tone"], string> = {
  blue: "bg-primary/15 text-primary",
  orange: "bg-warning/15 text-warning",
  teal: "bg-chart-2/15 text-chart-2",
};

const statusConfig: Record<TaskStatus, { label: string; dot: string }> = {
  completed: { label: "Completed", dot: "bg-success" },
  "in-progress": { label: "In Progress", dot: "bg-primary" },
  escalated: { label: "Escalated", dot: "bg-warning" },
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const priorityRank: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const statusRank: Record<TaskStatus, number> = {
  escalated: 0,
  "in-progress": 1,
  completed: 2,
};

const comparators: Record<TaskSortKey, (a: Task, b: Task) => number> = {
  date: (a, b) => b.date.localeCompare(a.date),
  priority: (a, b) => priorityRank[a.priority] - priorityRank[b.priority],
  status: (a, b) => statusRank[a.status] - statusRank[b.status],
  assignee: (a, b) => a.assignee.name.localeCompare(b.assignee.name),
};

const HeaderLabel = ({
  icon,
  children,
}: {
  icon: IconSvgElement;
  children: React.ReactNode;
}) => (
  <span className="text-muted-foreground flex items-center gap-1.5">
    <Icon icon={icon} className="size-3.5" strokeWidth={1.5} />
    {children}
  </span>
);

const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "date",
    header: () => <HeaderLabel icon={Calendar03Icon}>Date</HeaderLabel>,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-9 flex-col items-center justify-center rounded-lg text-center",
            dateTone[row.original.tone],
          )}
        >
          <span className="text-[10px] leading-none font-medium uppercase">
            {row.original.month}
          </span>
          <span className="text-sm leading-tight font-semibold">
            {row.original.day}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: () => <HeaderLabel icon={Task01Icon}>Task</HeaderLabel>,
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-foreground font-medium">
          {row.original.title}
        </span>
        <span className="text-muted-foreground text-xs">{row.original.id}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <HeaderLabel icon={StatusIcon}>Status</HeaderLabel>,
    cell: ({ row }) => {
      const status = statusConfig[row.original.status];
      return (
        <span className="flex items-center gap-2 text-sm">
          <span className={cn("size-2 rounded-full", status.dot)} />
          {status.label}
        </span>
      );
    },
  },
  {
    accessorKey: "priority",
    header: () => <HeaderLabel icon={FlagIcon}>Priority</HeaderLabel>,
    cell: ({ row }) => (
      <Badge variant="secondary" className="rounded-full font-medium">
        {priorityLabels[row.original.priority]}
      </Badge>
    ),
  },
  {
    accessorKey: "assignee",
    header: () => <HeaderLabel icon={UserIcon}>Assignee</HeaderLabel>,
    cell: ({ row }) => {
      const { name, avatar } = row.original.assignee;
      const initials = name
        .split(" ")
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("");
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground text-sm">{name}</span>
        </div>
      );
    },
  },
];

interface TasksTableProps {
  sortBy?: TaskSortKey;
  statuses?: TaskStatus[];
  priorities?: TaskPriority[];
}

export const TasksTable = ({
  sortBy = "date",
  statuses = [],
  priorities = [],
}: TasksTableProps) => {
  const data = React.useMemo(() => {
    const filtered = tasks.filter(
      (task) =>
        (statuses.length === 0 || statuses.includes(task.status)) &&
        (priorities.length === 0 || priorities.includes(task.priority)),
    );
    return [...filtered].sort(comparators[sortBy]);
  }, [sortBy, statuses, priorities]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;
  const groups = ["today", "this-week", "earlier"] as const;

  return (
    <div className="bg-card rounded-2xl border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold">Tasks</h2>
          <p className="text-muted-foreground text-sm">
            Track work across your team
          </p>
        </div>
        <Badge variant="secondary" className="rounded-full font-medium">
          {rows.length} {rows.length === 1 ? "task" : "tasks"}
        </Badge>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
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
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <span className="text-muted-foreground text-sm">
                  No tasks match your filters.
                </span>
              </TableCell>
            </TableRow>
          ) : null}
          {groups.map((group) => {
            const groupRows = rows.filter(
              (row) => row.original.group === group,
            );
            if (groupRows.length === 0) return null;
            return (
              <React.Fragment key={group}>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableCell colSpan={columns.length} className="py-2">
                    <span className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                      {groupLabels[group]}
                      <Badge
                        variant="secondary"
                        className="rounded-full px-1.5 text-[10px]"
                      >
                        {groupRows.length}
                      </Badge>
                    </span>
                  </TableCell>
                </TableRow>
                {groupRows.map((row) => (
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
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
