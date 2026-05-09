import { notFound } from "next/navigation";
import { getPillar, getPage } from "@/lib/content/contentDefinitions";
import PageReview from "./PageReview";

type PageProps = { params: Promise<{ pillar: string; pageSlug: string }> };

export default async function ReviewPageSlugPage({ params }: PageProps) {
  const { pillar, pageSlug } = await params;
  const pillarDef = getPillar(pillar);
  if (!pillarDef) notFound();

  const pageDef = getPage(pillar, pageSlug);
  if (!pageDef) notFound();

  const pageIndex = pillarDef.pages.findIndex((p) => p.slug === pageSlug);
  const nextPage = pillarDef.pages[pageIndex + 1] ?? null;

  return (
    <PageReview
      pillar={pillarDef}
      page={pageDef}
      pageIndex={pageIndex}
      totalPages={pillarDef.pages.length}
      nextPageSlug={nextPage?.slug ?? null}
    />
  );
}
