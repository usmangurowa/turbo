"use client";

import { usePathname } from "next/navigation";
import {
  aiNav,
  analyticsNav,
  platformNav,
  settingsNavItem,
} from "@/components/dashboard/nav-config";

import { Icon } from "@turbo/ui/components/icon";

const allNavItems = [
  ...platformNav,
  ...aiNav,
  ...analyticsNav,
  settingsNavItem,
];

export const PageTitle = () => {
  const pathname = usePathname();
  const item =
    allNavItems.find((navItem) => navItem.href === pathname) ?? platformNav[0];

  if (!item) return null;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="bg-accent flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium">
        <Icon icon={item.icon} className="size-4" strokeWidth={1.5} />
        {item.label}
      </div>
      <p className="text-muted-foreground hidden truncate text-sm lg:block">
        {item.description}
      </p>
    </div>
  );
};
