import { notFound } from "next/navigation";
import { getPillarBySlug } from "@/lib/db/pillars";
import { ReviewWorkspace } from "./ReviewWorkspace";

interface Props {
  params: Promise<{ slug: string; section: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug, section: sectionSlug } = await params;
  const pillar = await getPillarBySlug(slug);
  const section = pillar?.sections.find((s) => s.slug === sectionSlug);
  return {
    title: section ? `${section.name} · ${pillar?.name} - Profitia Review` : "Sekcja",
  };
}

export default async function SectionPage({ params }: Props) {
  const { slug, section: sectionSlug } = await params;
  const pillar = await getPillarBySlug(slug);

  if (!pillar) notFound();

  const sections = [...pillar.sections].sort((a, b) => a.order - b.order);
  const currentIndex = sections.findIndex((s) => s.slug === sectionSlug);

  if (currentIndex === -1) notFound();

  const section = sections[currentIndex];
  const nextSection = sections[currentIndex + 1] ?? null;

  return (
    <ReviewWorkspace
      pillarSlug={pillar.slug}
      pillarName={pillar.name}
      section={section}
      nextSectionSlug={nextSection?.slug ?? null}
      totalSections={sections.length}
      currentIndex={currentIndex}
    />
  );
}
