"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/auth/client";
import { useSession } from "@/hooks/use-session";
import {
  CreditCardIcon,
  Logout02Icon,
  MoonIcon,
  Notification01Icon,
  Sun03Icon,
  UnfoldMoreIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@turbo/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@turbo/ui/components/dropdown-menu";
import { Icon } from "@turbo/ui/components/icon";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@turbo/ui/components/sidebar";
import { Skeleton } from "@turbo/ui/components/skeleton";
import { useTheme } from "@turbo/ui/components/theme";

export const NavUser = () => {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const { resolvedTheme, setTheme } = useTheme();

  const handleLogout = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message ?? "Failed to sign out");
      return;
    }
    await refetch();
    router.push("/login");
  };

  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Skeleton className="size-8 rounded-lg" />
            <div className="grid flex-1 gap-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const name = session?.user.name ?? "Guest";
  const email = session?.user.email ?? "";
  const image = session?.user.image ?? undefined;
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={image} alt={name} />
                <AvatarFallback className="rounded-lg">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {email}
                </span>
              </div>
              <Icon icon={UnfoldMoreIcon} className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={image} alt={name} />
                  <AvatarFallback className="rounded-lg">
                    {initials || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => router.push("/onboarding")}>
                <Icon icon={UserIcon} />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon={CreditCardIcon} />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon={Notification01Icon} />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
              }}
            >
              <Icon icon={resolvedTheme === "dark" ? Sun03Icon : MoonIcon} />
              {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
              <Icon icon={Logout02Icon} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
