import { notFound } from "next/navigation";
import { getPillar } from "@/lib/content/contentDefinitions";
import FinalReview from "./FinalReview";

type PageProps = { params: Promise<{ pillar: string }> };

export default async function ReviewFinalPage({ params }: PageProps) {
  const { pillar } = await params;
  const pillarDef = getPillar(pillar);
  if (!pillarDef) notFound();

  return <FinalReview pillar={pillarDef} />;
}
