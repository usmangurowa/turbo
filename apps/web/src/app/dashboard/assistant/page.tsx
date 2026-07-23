import type { Metadata } from "next";
import { AssistantView } from "@/components/dashboard/assistant-view";
import { aiNav } from "@/components/dashboard/nav-config";

const assistantNavItem = aiNav.find((item) => item.slug === "assistant");

export const metadata: Metadata = {
  title: assistantNavItem?.label ?? "Assistant",
  description: assistantNavItem?.description,
};

export default function AssistantPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <AssistantView />
    </div>
  );
}
