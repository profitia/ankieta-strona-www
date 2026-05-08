"use client";

import { useEffect } from "react";
import { useReviewStore } from "@/stores/review-store";
import { useHydrated } from "@/hooks/useHydrated";
import { SectionListItem } from "@/components/shared/SectionListItem";
import { Loader2 } from "lucide-react";

interface Section {
  id: string;
  slug: string;
  name: string;
  order: number;
}

interface Props {
  pillarId: string;
  pillarSlug: string;
  sections: Section[];
}

export function PillarSectionList({ pillarId, pillarSlug, sections }: Props) {
  const hydrated = useHydrated();
  const { sessionId, pillarSlug: storedPillarSlug, setSession, isSectionComplete } = useReviewStore();

  // Create or reuse session for this pillar
  useEffect(() => {
    if (!hydrated) return;
    if (sessionId && storedPillarSlug === pillarSlug) return;

    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pillarId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.id) {
          setSession(data.data.id, pillarId, pillarSlug);
        }
      })
      .catch(console.error);
  }, [hydrated, pillarId, pillarSlug, sessionId, storedPillarSlug, setSession]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sections.map((section, index) => (
        <SectionListItem
          key={section.id}
          section={section}
          pillarSlug={pillarSlug}
          isComplete={isSectionComplete(pillarSlug, section.slug)}
          index={index}
        />
      ))}
    </div>
  );
}
