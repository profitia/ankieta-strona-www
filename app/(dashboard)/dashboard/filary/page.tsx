import Link from "next/link";
import prisma from "@/lib/prisma/client";
import { ALL_PILLARS } from "@/lib/content/contentDefinitions";

export const dynamic = "force-dynamic";

const PILLAR_LABEL: Record<string, string> = {
  wspolne: "Wspólne",
  doradztwo: "Doradztwo",
  edukacja: "Edukacja",
  career: "Kariera",
};

export default async function FilaryPage() {
  const sessionGroups = await prisma.contentSession.groupBy({
    by: ["pillarSlug", "status"],
    _count: { id: true },
  });

  const blockStats = await prisma.contentBlockReview.groupBy({
    by: ["approved"],
    _count: { id: true },
  });

  // Per-pillar stats
  const pillarStats = ALL_PILLARS.map((pillar) => {
    const completed = sessionGroups
      .filter((g) => g.pillarSlug === pillar.slug && g.status === "COMPLETED")
      .reduce((acc, g) => acc + g._count.id, 0);
    const inProgress = sessionGroups
      .filter((g) => g.pillarSlug === pillar.slug && g.status === "IN_PROGRESS")
      .reduce((acc, g) => acc + g._count.id, 0);
    const totalBlocks = pillar.pages.reduce((acc, p) => acc + p.blocks.length, 0);
    return { ...pillar, completed, inProgress, totalBlocks };
  });

  const totalCompleted = pillarStats.reduce((acc, p) => acc + p.completed, 0);

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>
          DASHBOARD · FILARY
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.03em", margin: 0 }}>
          Filary treści
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#767171", marginTop: "0.5rem" }}>
          {totalCompleted} ukończonych review w {ALL_PILLARS.length} filarach
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {pillarStats.map((pillar) => (
          <div
            key={pillar.slug}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #DDE3EE",
              padding: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "2rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "1.125rem", fontWeight: 500, color: "#242F44", margin: "0 0 0.25rem", letterSpacing: "-0.01em" }}>
                {PILLAR_LABEL[pillar.slug] ?? pillar.name}
              </p>
              <p style={{ fontSize: "0.8125rem", color: "#767171", margin: "0 0 0.875rem" }}>
                {pillar.description}
              </p>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                {[
                  { label: "Strony", value: pillar.pages.length },
                  { label: "Bloków", value: pillar.totalBlocks },
                  { label: "Review", value: pillar.completed },
                  ...(pillar.inProgress > 0 ? [{ label: "W toku", value: pillar.inProgress }] : []),
                ].map(({ label, value }) => (
                  <div key={label}>
                    <span style={{ fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC", display: "block" }}>
                      {label}
                    </span>
                    <span style={{ fontSize: "1.25rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.02em" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexShrink: 0 }}>
              <Link
                href={`/dashboard/filary/${pillar.slug}`}
                style={{
                  padding: "0.5rem 1.125rem",
                  backgroundColor: "#242F44",
                  color: "#FFFFFF",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                  textAlign: "center",
                }}
              >
                Analiza filaru →
              </Link>
              {pillar.pages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/dashboard/strony/${pillar.slug}/${page.slug}`}
                  style={{
                    padding: "0.375rem 1.125rem",
                    border: "1px solid #DDE3EE",
                    color: "#767171",
                    fontSize: "0.75rem",
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
