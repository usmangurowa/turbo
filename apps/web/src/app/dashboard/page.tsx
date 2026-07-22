import { Integrations } from "@/components/dashboard/integrations";
import { StatCards } from "@/components/dashboard/stat-cards";
import { TasksTable } from "@/components/dashboard/tasks-table";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <StatCards />
      <TasksTable />
      <Integrations />
    </div>
  );
}
