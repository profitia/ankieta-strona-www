"use client";

import { PillarCard } from "@/components/shared/PillarCard";
import { useReviewStore } from "@/stores/review-store";
import { useHydrated } from "@/hooks/useHydrated";

interface Pillar {
  id: string;
  slug: string;
  name: string;
  sections: { id: string }[];
}

export function PillarCardServer({ pillar }: { pillar: Pillar }) {
  const hydrated = useHydrated();
  const getCompletedCount = useReviewStore((s) => s.getCompletedCount);

  const completedCount = hydrated ? getCompletedCount(pillar.slug) : 0;

  return <PillarCard pillar={pillar} completedCount={completedCount} />;
}
