"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  aiNav,
  analyticsNav,
  platformNav,
  settingsNavItem,
} from "@/components/dashboard/nav-config";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@turbo/ui/components/command";
import { Icon } from "@turbo/ui/components/icon";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const groups = [
  { heading: "Navigation", items: platformNav },
  { heading: "AI", items: aiNav },
  { heading: "Analytics", items: analyticsNav },
];

export const SearchCommand = ({ open, onOpenChange }: SearchCommandProps) => {
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const run = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groups.map((group, index) => (
            <React.Fragment key={group.heading}>
              {index > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={group.heading}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.label}
                    onSelect={() => run(() => router.push(item.href))}
                  >
                    <Icon icon={item.icon} />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => run(() => router.push("/dashboard/tasks"))}
            >
              <Icon icon={PlusSignIcon} />
              New Task
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => run(() => router.push(settingsNavItem.href))}
            >
              <Icon icon={settingsNavItem.icon} />
              {settingsNavItem.label}
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
