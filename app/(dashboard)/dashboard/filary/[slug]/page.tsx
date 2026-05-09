import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma/client";
import { getPillar, getBlock } from "@/lib/content/contentDefinitions";
import { AiSummaryBlock } from "@/components/dashboard/AiSummaryBlock";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

function fmt(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pl-PL", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
}

const PILLAR_LABEL: Record<string, string> = {
  wspolne: "Wspólne",
  doradztwo: "Doradztwo",
  edukacja: "Edukacja",
  career: "Kariera",
};

export default async function FilarDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const pillar = getPillar(slug);
  if (!pillar) notFound();

  const [sessions, cachedSummary] = await Promise.all([
    prisma.contentSession.findMany({
      where: { pillarSlug: slug },
      orderBy: { startedAt: "desc" },
      include: {
        blockReviews: { select: { blockId: true, approved: true, suggestion: true } },
        finalAnswers: { select: { questionId: true, approved: true, comment: true } },
      },
    }),
    prisma.aiSummary.findUnique({ where: { scope_scopeId: { scope: "pillar", scopeId: slug } } }),
  ]);

  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");

  // Aggregate per block
  const allBlocks = pillar.pages.flatMap((p) => p.blocks);
  const blockMap = new Map<string, {
    blockId: string; section: string; label: string; currentText: string;
    pageTitle: string; pageSlug: string;
    totalReviews: number; approvedCount: number; suggestions: string[];
  }>();

  for (const page of pillar.pages) {
    for (const block of page.blocks) {
      blockMap.set(block.id, {
        blockId: block.id, section: block.section, label: block.label, currentText: block.currentText,
        pageTitle: page.title, pageSlug: page.slug,
        totalReviews: 0, approvedCount: 0, suggestions: [],
      });
    }
  }

  for (const session of completedSessions) {
    for (const br of session.blockReviews) {
      const entry = blockMap.get(br.blockId);
      if (entry) {
        entry.totalReviews++;
        if (br.approved) entry.approvedCount++;
        if (br.suggestion) entry.suggestions.push(br.suggestion);
      }
    }
  }

  const totalApproved = Array.from(blockMap.values()).reduce((acc, b) => acc + b.approvedCount, 0);
  const totalReviewed = Array.from(blockMap.values()).reduce((acc, b) => acc + b.totalReviews, 0);
  const totalRejected = totalReviewed - totalApproved;

  return (
    <div style={{ maxWidth: "860px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/dashboard/filary" style={{ fontSize: "0.8125rem", color: "#A6B2CC", textDecoration: "none" }}>
          ← Filary
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid #DDE3EE" }}>
        <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>
          FILAR
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.03em", margin: "0 0 1rem" }}>
          {PILLAR_LABEL[slug] ?? pillar.name}
        </h1>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {[
            { label: "Ukończone review", value: completedSessions.length },
            { label: "Ocenionych bloków", value: totalReviewed },
            { label: "Zatwierdzonych", value: totalApproved, accent: "#186B47" },
            { label: "Do zmiany", value: totalRejected, accent: totalRejected > 0 ? "#8E0055" : "#A6B2CC" },
            { label: "Stron w filarze", value: pillar.pages.length },
          ].map(({ label, value, accent }) => (
            <div key={label}>
              <span style={{ fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC", display: "block", marginBottom: "0.125rem" }}>
                {label}
              </span>
              <span style={{ fontSize: "1.5rem", fontWeight: 300, color: accent ?? "#242F44", letterSpacing: "-0.025em" }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Synthesis */}
      <AiSummaryBlock
        scope="pillar"
        scopeId={slug}
        initialSummary={cachedSummary?.content}
        label="AI Synthesis — analiza filaru"
      />

      {/* Per-page block analysis */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", letterSpacing: "-0.01em", marginBottom: "1.5rem" }}>
          Analiza bloków
        </h2>

        {pillar.pages.map((page) => {
          const pageBlocks = Array.from(blockMap.values()).filter((b) => b.pageSlug === page.slug);
          const pageApproved = pageBlocks.reduce((a, b) => a + b.approvedCount, 0);
          const pageTotal = pageBlocks.reduce((a, b) => a + b.totalReviews, 0);
          const pageRate = pageTotal > 0 ? Math.round((pageApproved / pageTotal) * 100) : null;

          return (
            <div key={page.slug} style={{ marginBottom: "2.5rem" }}>
              {/* Page label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "1rem",
                  padding: "0.625rem 1rem",
                  backgroundColor: "#F4F6FA",
                  borderLeft: "3px solid #242F44",
                  marginBottom: "0.75rem",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#242F44" }}>{page.title}</span>
                  <a href={page.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#006D9E", textDecoration: "none" }}>
                    {page.url} ↗
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {pageRate !== null && (
                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: pageRate >= 70 ? "#186B47" : pageRate >= 40 ? "#7A5C00" : "#8E0055" }}>
                      {pageRate}% akceptacji
                    </span>
                  )}
                  <Link href={`/dashboard/strony/${slug}/${page.slug}`} style={{ fontSize: "0.75rem", color: "#006D9E", textDecoration: "none", fontWeight: 500 }}>
                    Analiza strony →
                  </Link>
                </div>
              </div>

              {/* Blocks */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {pageBlocks.map((block) => {
                  const rate = block.totalReviews > 0 ? Math.round((block.approvedCount / block.totalReviews) * 100) : null;
                  const hasSuggestions = block.suggestions.length > 0;

                  return (
                    <div
                      key={block.blockId}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #DDE3EE",
                        padding: "0.875rem 1.125rem",
                        borderLeft: `3px solid ${rate === null ? "#DDE3EE" : rate >= 70 ? "#BBE5C7" : rate >= 40 ? "#F0D98C" : "#F2C4D8"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC" }}>
                              {block.section}
                            </span>
                            <span style={{ fontSize: "0.625rem", color: "#DDE3EE" }}>·</span>
                            <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#767171" }}>{block.label}</span>
                          </div>
                          <p style={{ fontSize: "0.875rem", color: "#3B3838", lineHeight: 1.6, margin: 0 }}>
                            {block.currentText.slice(0, 160)}{block.currentText.length > 160 ? "…" : ""}
                          </p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          {rate !== null ? (
                            <span style={{ fontSize: "1rem", fontWeight: 500, color: rate >= 70 ? "#186B47" : rate >= 40 ? "#7A5C00" : "#8E0055" }}>
                              {rate}%
                            </span>
                          ) : (
                            <span style={{ fontSize: "0.75rem", color: "#A6B2CC" }}>brak danych</span>
                          )}
                          {block.totalReviews > 0 && (
                            <span style={{ display: "block", fontSize: "0.625rem", color: "#A6B2CC", marginTop: "0.125rem" }}>
                              {block.approvedCount}/{block.totalReviews}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Suggestions */}
                      {hasSuggestions && (
                        <div style={{ marginTop: "0.875rem", paddingTop: "0.75rem", borderTop: "1px solid #F0F3F9" }}>
                          <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8E0055", marginBottom: "0.5rem" }}>
                            Propozycje zmian ({block.suggestions.length})
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                            {block.suggestions.map((s, i) => (
                              <p
                                key={i}
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#3B3838",
                                  lineHeight: 1.65,
                                  margin: 0,
                                  padding: "0.5rem 0.75rem",
                                  backgroundColor: "#FDFBFC",
                                  borderLeft: "2px solid #E4C4D4",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {s}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Session list */}
      <section>
        <h2 style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", letterSpacing: "-0.01em", marginBottom: "1rem" }}>
          Sesje ({sessions.length})
        </h2>
        {sessions.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "#A6B2CC" }}>Brak sesji dla tego filaru.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {sessions.map((s) => {
              const approved = s.blockReviews.filter((b) => b.approved).length;
              const rejected = s.blockReviews.length - approved;
              return (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1.125rem",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #DDE3EE",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.8125rem", color: "#242F44" }}>{fmt(s.startedAt)}</span>
                    <span style={{ fontSize: "0.6875rem", color: "#A6B2CC", marginLeft: "0.75rem", fontFamily: "monospace" }}>#{s.id.slice(-6)}</span>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#186B47", fontWeight: 500 }}>✓ {approved}</span>
                    <span style={{ fontSize: "0.8125rem", color: rejected > 0 ? "#8E0055" : "#A6B2CC", fontWeight: rejected > 0 ? 600 : 400 }}>✕ {rejected}</span>
                    <span
                      style={{
                        fontSize: "0.625rem",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: s.status === "COMPLETED" ? "#186B47" : "#7A5C00",
                        backgroundColor: s.status === "COMPLETED" ? "#F0FDF4" : "#FFFBEB",
                        padding: "0.125rem 0.5rem",
                      }}
                    >
                      {s.status === "COMPLETED" ? "Ukończona" : "W toku"}
                    </span>
                    <Link href={`/dashboard/review/${s.id}`} style={{ fontSize: "0.8125rem", color: "#006D9E", textDecoration: "none", fontWeight: 500 }}>
                      Otwórz →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
