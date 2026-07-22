"use client";

import { useSearchCommand } from "@/components/dashboard/search-context";
import {
  Csv01Icon,
  FileExportIcon,
  Pdf01Icon,
  Search01Icon,
  Upload03Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@turbo/ui/components/avatar";
import { Button } from "@turbo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@turbo/ui/components/dropdown-menu";
import { Icon } from "@turbo/ui/components/icon";

const members = [
  { initials: "AY", className: "bg-primary/15 text-primary" },
  { initials: "SC", className: "bg-chart-3/15 text-chart-3" },
];

export const HeaderActions = () => {
  const { openSearch } = useSearchCommand();

  const exportAs = (format: string) => {
    toast.success(`Export started`, {
      description: `Your ${format} file will be ready shortly.`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="hidden -space-x-2 md:flex">
        {members.map((member) => (
          <Avatar
            key={member.initials}
            className="ring-background size-7 ring-2"
          >
            <AvatarFallback
              className={`text-[10px] font-medium ${member.className}`}
            >
              {member.initials}
            </AvatarFallback>
          </Avatar>
        ))}
        <Avatar className="ring-background size-7 ring-2">
          <AvatarFallback className="bg-secondary text-muted-foreground text-[10px] font-medium">
            +1
          </AvatarFallback>
        </Avatar>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="Search"
        onClick={openSearch}
      >
        <Icon icon={Search01Icon} />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="rounded-full">
            <Icon icon={Upload03Icon} />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Export data</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => exportAs("CSV")}>
            <Icon icon={Csv01Icon} />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => exportAs("PDF")}>
            <Icon icon={Pdf01Icon} />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => exportAs("full backup")}>
            <Icon icon={FileExportIcon} />
            Export everything
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
