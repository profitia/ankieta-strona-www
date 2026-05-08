import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Reviews</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review sessions and section-level feedback.
        </p>
      </div>

      <EmptyState
        icon={<ClipboardList className="h-6 w-6" />}
        title="No review sessions yet"
        description="Start a review session from a Pillar page to see results here."
      />
    </div>
  );
}
