"use client";

import type { ApiTask } from "@/hooks/use-tasks";
import * as React from "react";
import { useTasks } from "@/hooks/use-tasks";
import { TradeDownIcon, TradeUpIcon } from "@hugeicons/core-free-icons";

import { Icon } from "@turbo/ui/components/icon";
import { NumberTicker } from "@turbo/ui/components/number-ticker";
import { cn } from "@turbo/ui/lib/utils";

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  caption: string;
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
    value: 42,
    suffix: "m",
    caption: "8m faster than last week",
    trend: -16.1,
  },
  { label: "Escalations", value: 12, caption: "3 urgent open", trend: -25.0 },
];

const StatCard = ({ stat }: { stat: Stat }) => {
  const improving =
    stat.label === "Avg. response" || stat.label === "Escalations"
      ? stat.trend < 0
      : stat.trend > 0;

  return (
    <div
      data-slot="stat-card"
      className="bg-card flex flex-col gap-4 rounded-2xl border border-dashed p-6"
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{stat.label}</span>
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            improving ? "text-success" : "text-warning",
          )}
        >
          <Icon
            icon={stat.trend >= 0 ? TradeUpIcon : TradeDownIcon}
            className="size-3.5"
          />
          {Math.abs(stat.trend)}%
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <NumberTicker
          value={stat.value}
          className="text-foreground text-5xl font-medium tracking-tight"
        />
        {stat.suffix ? (
          <span className="text-muted-foreground text-2xl font-medium">
            {stat.suffix}
          </span>
        ) : null}
      </div>
      <p className="text-muted-foreground text-xs">{stat.caption}</p>
    </div>
  );
};

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
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
};
