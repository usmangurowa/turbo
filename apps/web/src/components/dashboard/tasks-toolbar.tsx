"use client";

import type {
  TaskPriority,
  TaskSortKey,
  TaskStatus,
} from "@/components/dashboard/tasks-table";
import {
  FilterHorizontalIcon,
  Sorting01Icon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@turbo/ui/components/badge";
import { Button } from "@turbo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@turbo/ui/components/dropdown-menu";
import { Icon } from "@turbo/ui/components/icon";
import { Separator } from "@turbo/ui/components/separator";

const sortLabels: Record<TaskSortKey, string> = {
  date: "Date",
  priority: "Priority",
  status: "Status",
  assignee: "Assignee",
};

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "completed", label: "Completed" },
  { value: "in-progress", label: "In Progress" },
  { value: "escalated", label: "Escalated" },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const toggle = <T,>(values: T[], value: T) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

interface TasksToolbarProps {
  sortBy: TaskSortKey;
  onSortByChange: (key: TaskSortKey) => void;
  statuses: TaskStatus[];
  onStatusesChange: (statuses: TaskStatus[]) => void;
  priorities: TaskPriority[];
  onPrioritiesChange: (priorities: TaskPriority[]) => void;
}

export const TasksToolbar = ({
  sortBy,
  onSortByChange,
  statuses,
  onStatusesChange,
  priorities,
  onPrioritiesChange,
}: TasksToolbarProps) => {
  const activeFilters = statuses.length + priorities.length;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="rounded-full">
            <Icon icon={Sorting01Icon} />
            <span className="text-muted-foreground">
              Sorted by{" "}
              <span className="text-foreground font-semibold">
                {sortLabels[sortBy]}
              </span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={sortBy}
            onValueChange={(value) => onSortByChange(value as TaskSortKey)}
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <DropdownMenuRadioItem key={value} value={value}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator
        orientation="vertical"
        className="data-[orientation=vertical]:h-4"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full">
            <Icon icon={FilterHorizontalIcon} />
            Filter
            {activeFilters > 0 ? (
              <Badge className="size-4 justify-center rounded-full p-0 text-[10px]">
                {activeFilters}
              </Badge>
            ) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {statusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={statuses.includes(option.value)}
              onCheckedChange={() =>
                onStatusesChange(toggle(statuses, option.value))
              }
              onSelect={(event) => event.preventDefault()}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Priority</DropdownMenuLabel>
          {priorityOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={priorities.includes(option.value)}
              onCheckedChange={() =>
                onPrioritiesChange(toggle(priorities, option.value))
              }
              onSelect={(event) => event.preventDefault()}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
          {activeFilters > 0 ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  onStatusesChange([]);
                  onPrioritiesChange([]);
                }}
              >
                Clear filters
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
