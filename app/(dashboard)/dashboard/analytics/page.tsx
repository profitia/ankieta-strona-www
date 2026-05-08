import { BarChart2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregate scores and trends across all review sessions.
        </p>
      </div>

      <EmptyState
        icon={<BarChart2 className="h-6 w-6" />}
        title="No data to display"
        description="Analytics will be available once review sessions are completed."
      />
    </div>
  );
}
