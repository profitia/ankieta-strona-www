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

export default async function StronyPage() {
  // Get block review stats per page (blockId encodes page via prefix convention)
  const blockReviews = await prisma.contentBlockReview.findMany({
    select: { blockId: true, approved: true },
  });

  // Map blockId -> page. We need to look up pillar/page slug from blockId
  const blockIdToPage = new Map<string, { pillarSlug: string; pageSlug: string }>();
  for (const pillar of ALL_PILLARS) {
    for (const page of pillar.pages) {
      for (const block of page.blocks) {
        blockIdToPage.set(block.id, { pillarSlug: pillar.slug, pageSlug: page.slug });
      }
    }
  }

  // Aggregate per page
  const pageStats = new Map<string, { total: number; approved: number }>();
  for (const br of blockReviews) {
    const loc = blockIdToPage.get(br.blockId);
    if (!loc) continue;
    const key = `${loc.pillarSlug}:${loc.pageSlug}`;
    const existing = pageStats.get(key) ?? { total: 0, approved: 0 };
    existing.total++;
    if (br.approved) existing.approved++;
    pageStats.set(key, existing);
  }

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>
          DASHBOARD · STRONY
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.03em", margin: 0 }}>
          Strony witryny
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#767171", marginTop: "0.5rem" }}>
          {ALL_PILLARS.reduce((acc, p) => acc + p.pages.length, 0)} stron w {ALL_PILLARS.length} filarach
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {ALL_PILLARS.map((pillar) => (
          <div key={pillar.slug}>
            {/* Pillar header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.625rem 1rem",
                backgroundColor: "#F4F6FA",
                borderLeft: "3px solid #242F44",
                marginBottom: "0.75rem",
              }}
            >
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#242F44" }}>
                {PILLAR_LABEL[pillar.slug] ?? pillar.name}
              </span>
              <Link href={`/dashboard/filary/${pillar.slug}`} style={{ fontSize: "0.75rem", color: "#006D9E", textDecoration: "none" }}>
                Analiza filaru →
              </Link>
            </div>

            {/* Pages */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {pillar.pages.map((page) => {
                const key = `${pillar.slug}:${page.slug}`;
                const stats = pageStats.get(key);
                const rate = stats && stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : null;

                return (
                  <div
                    key={page.slug}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.875rem 1.125rem",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #DDE3EE",
                      gap: "1rem",
                      borderLeft: rate === null ? "1px solid #DDE3EE" : `3px solid ${rate >= 70 ? "#BBE5C7" : rate >= 40 ? "#F0D98C" : "#F2C4D8"}`,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#242F44", margin: "0 0 0.125rem" }}>
                        {page.title}
                      </p>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "0.75rem", color: "#A6B2CC", textDecoration: "none" }}
                      >
                        {page.url} ↗
                      </a>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexShrink: 0 }}>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ display: "block", fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC" }}>
                          Bloków
                        </span>
                        <span style={{ fontSize: "1rem", fontWeight: 300, color: "#242F44" }}>{page.blocks.length}</span>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ display: "block", fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC" }}>
                          Akceptacja
                        </span>
                        <span style={{ fontSize: "1rem", fontWeight: 500, color: rate === null ? "#A6B2CC" : rate >= 70 ? "#186B47" : rate >= 40 ? "#7A5C00" : "#8E0055" }}>
                          {rate === null ? "—" : `${rate}%`}
                        </span>
                      </div>
                      {stats && (
                        <div style={{ textAlign: "center" }}>
                          <span style={{ display: "block", fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC" }}>
                            Ocen
                          </span>
                          <span style={{ fontSize: "1rem", fontWeight: 300, color: "#242F44" }}>{stats.total}</span>
                        </div>
                      )}
                      <Link
                        href={`/dashboard/strony/${pillar.slug}/${page.slug}`}
                        style={{
                          padding: "0.375rem 0.875rem",
                          border: "1px solid #DDE3EE",
                          color: "#006D9E",
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          textDecoration: "none",
                        }}
                      >
                        Analiza →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
