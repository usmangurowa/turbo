"use client";

import type { DashboardNavItem } from "@/components/dashboard/nav-config";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  aiNav,
  analyticsNav,
  platformNav,
  settingsNavItem,
} from "@/components/dashboard/nav-config";
import { TurboLogo } from "@/components/turbo-logo";
import { Search01Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@turbo/ui/components/icon";
import { Kbd, KbdGroup } from "@turbo/ui/components/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@turbo/ui/components/sidebar";

import { NavUser } from "./nav-user";
import { SearchCommand } from "./search-command";

const NavGroup = ({
  label,
  items,
  pathname,
}: {
  label: string;
  items: DashboardNavItem[];
  pathname: string;
}) => (
  <SidebarGroup>
    <SidebarGroupLabel>{label}</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              tooltip={item.label}
              isActive={pathname === item.href}
            >
              <Link href={item.href}>
                <Icon icon={item.icon} />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

export const AppSidebar = (props: React.ComponentProps<typeof Sidebar>) => {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/dashboard">
                  <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <TurboLogo size="sm" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Turbo</span>
                    <span className="text-muted-foreground truncate text-xs">
                      Workspace
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Search"
                onClick={() => setSearchOpen(true)}
              >
                <Icon icon={Search01Icon} />
                <span className="flex-1 text-left">Search</span>
                <KbdGroup className="group-data-[collapsible=icon]:hidden">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavGroup label="Platform" items={platformNav} pathname={pathname} />
          <NavGroup label="AI" items={aiNav} pathname={pathname} />
          <NavGroup
            label="Analytics"
            items={analyticsNav}
            pathname={pathname}
          />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={settingsNavItem.label}
                isActive={pathname === settingsNavItem.href}
              >
                <Link href={settingsNavItem.href}>
                  <Icon icon={settingsNavItem.icon} />
                  <span>{settingsNavItem.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <NavUser />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};
