import { Layers } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function PillarsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Pillars</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage content pillars and their sections.
        </p>
      </div>

      <EmptyState
        icon={<Layers className="h-6 w-6" />}
        title="No pillars loaded"
        description="Run db:seed to populate pillars from the database."
      />
    </div>
  );
}
