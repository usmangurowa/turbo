"use client";

import type {
  TaskPriority,
  TaskSortKey,
  TaskStatus,
} from "@/components/dashboard/tasks-table";
import * as React from "react";
import { Integrations } from "@/components/dashboard/integrations";
import { PageToolbar } from "@/components/dashboard/page-toolbar";
import { StatCards } from "@/components/dashboard/stat-cards";
import { TasksTable } from "@/components/dashboard/tasks-table";
import { TasksToolbar } from "@/components/dashboard/tasks-toolbar";

export const OverviewView = () => {
  const [sortBy, setSortBy] = React.useState<TaskSortKey>("date");
  const [statuses, setStatuses] = React.useState<TaskStatus[]>([]);
  const [priorities, setPriorities] = React.useState<TaskPriority[]>([]);

  return (
    <div className="flex flex-1 flex-col">
      <PageToolbar>
        <TasksToolbar
          sortBy={sortBy}
          onSortByChange={setSortBy}
          statuses={statuses}
          onStatusesChange={setStatuses}
          priorities={priorities}
          onPrioritiesChange={setPriorities}
        />
      </PageToolbar>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <StatCards />
        <TasksTable
          sortBy={sortBy}
          statuses={statuses}
          priorities={priorities}
        />
        <Integrations />
      </div>
    </div>
  );
};
