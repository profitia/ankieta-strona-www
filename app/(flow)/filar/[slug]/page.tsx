import Link from "next/link";
import { notFound } from "next/navigation";
import { getPillarBySlug } from "@/lib/db/pillars";
import { PillarSectionList } from "./PillarSectionList";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const pillar = await getPillarBySlug(slug);
  return { title: pillar ? `${pillar.name} - Profitia Review` : "Filar" };
}

export default async function PillarPage({ params }: Props) {
  const { slug } = await params;
  const pillar = await getPillarBySlug(slug);

  if (!pillar) notFound();

  const sections = [...pillar.sections].sort((a, b) => a.order - b.order);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #DDE3EE",
          height: "48px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "640px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            gap: 0,
          }}
        >
          <Link
            href="/filar"
            style={{
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#A6A6A6",
              textDecoration: "none",
              transition: "color 150ms",
            }}
            className="hover:text-navy"
          >
            ← Powrót do filarów
          </Link>
          <span style={{ margin: "0 0.875rem", color: "#D9D9D9", fontSize: "0.75rem" }}>·</span>
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#242F44",
            }}
          >
            {pillar.name}
          </span>
        </div>
      </header>

      {/* Content */}
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "4rem 2rem 6rem",
        }}
      >
        {/* Intro */}
        <div style={{ marginBottom: "3rem" }}>
          <p className="label-procedural" style={{ marginBottom: "0.625rem" }}>
            Sekcje do oceny
          </p>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 300,
              color: "#242F44",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: "0.875rem",
            }}
          >
            {pillar.name}
          </h1>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "#767171",
              lineHeight: 1.75,
              maxWidth: "52ch",
            }}
          >
            Oceń każdą z {sections.length} sekcji. Możesz zacząć od dowolnej
            i wracać do pozostałych w dowolnej kolejności.
          </p>
        </div>

        {/* Section list */}
        <div style={{ borderTop: "1px solid #DDE3EE" }}>
          <PillarSectionList
            pillarId={pillar.id}
            pillarSlug={pillar.slug}
            sections={sections}
          />
        </div>
      </div>
    </div>
  );
}
