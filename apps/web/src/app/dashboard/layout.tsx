import type { Metadata } from "next";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { HeaderActions } from "@/components/dashboard/header-actions";
import { PageTitle } from "@/components/dashboard/page-title";
import { SearchProvider } from "@/components/dashboard/search-context";

import { Separator } from "@turbo/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@turbo/ui/components/sidebar";
import { ThemeToggle } from "@turbo/ui/components/theme";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your workspace overview",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <SearchProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="bg-background/80 sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
            <div className="flex w-full items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="my-auto mr-2 data-[orientation=vertical]:h-4"
              />
              <PageTitle />
              <div className="ml-auto flex items-center gap-2">
                <HeaderActions />
                <ThemeToggle />
              </div>
            </div>
          </header>
          {children}
        </SidebarInset>
      </SearchProvider>
    </SidebarProvider>
  );
}
