import type { IconSvgElement } from "@hugeicons/react";
import {
  AiChat02Icon,
  ChartLineData01Icon,
  DashboardSquare01Icon,
  InboxIcon,
  PieChartIcon,
  Settings01Icon,
  SparklesIcon,
  Task01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

export interface DashboardNavItem {
  label: string;
  slug: string | null;
  href: string;
  icon: IconSvgElement;
  description: string;
}

const item = (
  label: string,
  slug: string | null,
  icon: IconSvgElement,
  description: string,
): DashboardNavItem => ({
  label,
  slug,
  href: slug ? `/dashboard/${slug}` : "/dashboard",
  icon,
  description,
});

export const platformNav: DashboardNavItem[] = [
  item("Overview", null, DashboardSquare01Icon, "Your workspace at a glance."),
  item("Tasks", "tasks", Task01Icon, "Track work across your team."),
  item("Inbox", "inbox", InboxIcon, "Messages and mentions in one place."),
  item(
    "Customers",
    "customers",
    UserGroupIcon,
    "Everyone your team works with.",
  ),
];

export const aiNav: DashboardNavItem[] = [
  item(
    "Assistant",
    "assistant",
    AiChat02Icon,
    "Ask questions about your workspace.",
  ),
  item(
    "Prompt Library",
    "prompts",
    SparklesIcon,
    "Reusable prompts for your team.",
  ),
];

export const analyticsNav: DashboardNavItem[] = [
  item(
    "Trends",
    "trends",
    ChartLineData01Icon,
    "How your metrics move over time.",
  ),
  item("Reports", "reports", PieChartIcon, "Shareable summaries of your data."),
];

export const settingsNavItem: DashboardNavItem = item(
  "Settings",
  "settings",
  Settings01Icon,
  "Workspace preferences and configuration.",
);

export const sectionNavItems: DashboardNavItem[] = [
  ...platformNav,
  ...aiNav,
  ...analyticsNav,
  settingsNavItem,
].filter((navItem) => navItem.slug !== null);
