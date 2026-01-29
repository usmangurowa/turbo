"use client";

export const SessionFilters = () => null;

/*

import type { DateRangePreset } from "@/hooks/use-date-range";
import type { IconSvgElement } from "@hugeicons/react";
import { useMemo } from "react";
import { dateRanges, useDateRange } from "@/hooks/use-date-range";
import { useSessionFilters } from "@/hooks/use-session-filters";
import { api } from "@/lib/api";
import {
  Activity01Icon,
  Calendar03Icon,
  FilterHorizontalIcon,
  FolderOpenIcon,
  GitBranchIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@turbo/ui/badge";
import { Button } from "@turbo/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@turbo/ui/dropdown-menu";

type FilterKey = "project" | "branch" | "action";

interface FilterItem {
  key: FilterKey;
  label: string;
  icon: IconSvgElement;
  subItems: string[];
}

export const SessionFilters = () => {
  const { filters, setFilters } = useSessionFilters();
  const { startDate, endDate, preset, setDateRange } = useDateRange();

  // Fetch facets
  const { data: facets } = useQuery({
    queryKey: [
      "session-facets",
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: async () => {
      const res = await api.sessions.facets.$get({
        query: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch facets");
      return res.json();
    },
    staleTime: 60000, // 1 minute
  });

  // Map facets to filter items
  const filterItems = useMemo<FilterItem[]>(() => {
    const projects = (facets?.projects ?? []).filter((p) => p !== null);
    const branches = (facets?.branches ?? []).filter((b) => b !== null);
    const actions = (facets?.actions ?? []).filter(
      (a) => a !== null,
    ) as string[];

    return [
      {
        key: "project",
        label: "Project",
        icon: FolderOpenIcon,
        subItems: projects,
      },
      {
        key: "branch",
        label: "Branch",
        icon: GitBranchIcon,
        subItems: branches,
      },
      {
        key: "action",
        label: "Action",
        icon: Activity01Icon,
        subItems: actions,
      },
    ];
  }, [facets]);

  const toggleFilter = (key: FilterKey, value: string) => {
    const current = filters[key];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    void setFilters({ [key]: newValues.length ? newValues : null });
  "use client";

  export const SessionFilters = () => null;
    void setFilters({ project: null, branch: null, action: null });
*/
