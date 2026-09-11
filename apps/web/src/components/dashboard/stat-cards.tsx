"use client";

import type { ApiTask } from "@/hooks/use-tasks";
import * as React from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { useTasks } from "@/hooks/use-tasks";
import { TradeDownIcon, TradeUpIcon } from "@hugeicons/core-free-icons";

import { Icon } from "@turbo/ui/components/icon";
import { NumberTicker } from "@turbo/ui/components/number-ticker";
import { cn } from "@turbo/ui/lib/utils";

interface Stat {
  label: string;
  /** Shown behind an info icon when the label hides a calculation. */
  hint?: string;
  value: number;
  suffix?: string;
  caption: string;
  captionTone?: "success" | "warning";
  trend: number;
}

const sampleStats: Stat[] = [
  { label: "Active tasks", value: 128, caption: "+12 this week", trend: 10.4 },
  {
    label: "Resolved",
    value: 1024,
    caption: "94% resolution rate",
    trend: 6.2,
  },
  {
    label: "Avg. response",
    hint: "Mean time from a task's creation to its first status change, over the last 7 days.",
    value: 42,
    suffix: "m",
    caption: "8m faster than last week",
    trend: -16.1,
  },
  {
    label: "Escalations",
    value: 12,
    caption: "3 urgent open",
    captionTone: "warning",
    trend: -25.0,
  },
];

const TrendBadge = ({ stat }: { stat: Stat }) => {
  const improving =
    stat.label === "Avg. response" || stat.label === "Escalations"
      ? stat.trend < 0
      : stat.trend > 0;

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs font-medium tabular-nums",
        improving ? "text-success" : "text-warning",
      )}
    >
      <Icon
        icon={stat.trend >= 0 ? TradeUpIcon : TradeDownIcon}
        className="size-3.5"
      />
      {Math.abs(stat.trend)}%
    </span>
  );
};

const TaskStatCard = ({ stat }: { stat: Stat }) => (
  <StatCard
    size="hero"
    label={stat.label}
    hint={stat.hint}
    action={<TrendBadge stat={stat} />}
    dim={stat.value === 0}
    value={
      <span className="flex items-baseline gap-1">
        <NumberTicker value={stat.value} />
        {stat.suffix ? (
          <span className="text-muted-foreground text-xl font-medium">
            {stat.suffix}
          </span>
        ) : null}
      </span>
    }
    caption={stat.caption}
    captionTone={stat.captionTone}
  />
);

export const StatCards = () => {
  const { data: apiTasks } = useTasks();

  const stats = React.useMemo(() => {
    if (!apiTasks || apiTasks.length === 0) return sampleStats;
    const count = (status: ApiTask["status"]) =>
      apiTasks.filter((task) => task.status === status).length;
    return sampleStats.map((stat) => {
      switch (stat.label) {
        case "Active tasks":
          return { ...stat, value: count("pending") + count("in-progress") };
        case "Resolved":
          return { ...stat, value: count("completed") };
        case "Escalations":
          return { ...stat, value: count("escalated") };
        // "Avg. response" is not derivable from task rows; keep the sample.
        default:
          return stat;
      }
    });
  }, [apiTasks]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <TaskStatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
};
