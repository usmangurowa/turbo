import type { Metadata } from "next";
import { ApiKeysCard } from "@/components/dashboard/api-keys-card";
import { settingsNavItem } from "@/components/dashboard/nav-config";

export const metadata: Metadata = {
  title: settingsNavItem.label,
  description: settingsNavItem.description,
};

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <ApiKeysCard />
    </div>
  );
}
