"use client";

import { usePathname } from "next/navigation";
import { sectionNavItems } from "@/components/dashboard/nav-config";

export const PageTitle = () => {
  const pathname = usePathname();
  const item = sectionNavItems.find((navItem) => navItem.href === pathname);

  return <h1 className="text-sm font-medium">{item?.label ?? "Overview"}</h1>;
};
