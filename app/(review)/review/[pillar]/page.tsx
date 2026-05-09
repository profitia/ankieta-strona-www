import { notFound, redirect } from "next/navigation";
import { getPillar } from "@/lib/content/contentDefinitions";
import PillarStart from "./PillarStart";

type PageProps = { params: Promise<{ pillar: string }> };

export default async function ReviewPillarPage({ params }: PageProps) {
  const { pillar } = await params;
  const pillarDef = getPillar(pillar);
  if (!pillarDef) notFound();

  return <PillarStart pillar={pillarDef} />;
}

export async function generateStaticParams() {
  return [];
}
