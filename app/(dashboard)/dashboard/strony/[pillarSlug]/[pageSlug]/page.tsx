import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma/client";
import { getPillar, getPage, getBlock, FINAL_QUESTIONS } from "@/lib/content/contentDefinitions";
import { AiSummaryBlock } from "@/components/dashboard/AiSummaryBlock";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ pillarSlug: string; pageSlug: string }> };

const PILLAR_LABEL: Record<string, string> = {
  wspolne: "Wspólne",
  doradztwo: "Doradztwo",
  edukacja: "Edukacja",
  career: "Kariera",
};

export default async function PageDetailPage({ params }: PageProps) {
  const { pillarSlug, pageSlug } = await params;
  const page = getPage(pillarSlug, pageSlug);
  if (!page) notFound();

  const scopeId = `${pillarSlug}:${pageSlug}`;

  // All block reviews for this page's blocks
  const blockIds = page.blocks.map((b) => b.id);

  const [blockReviews, cachedSummary, sessions] = await Promise.all([
    prisma.contentBlockReview.findMany({
      where: { blockId: { in: blockIds } },
      include: {
        session: {
          select: { id: true, pillarSlug: true, startedAt: true, completedAt: true, status: true, ipAddress: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.aiSummary.findUnique({ where: { scope_scopeId: { scope: "page", scopeId } } }),
    prisma.contentSession.findMany({
      where: { pillarSlug, blockReviews: { some: { blockId: { in: blockIds } } } },
      orderBy: { startedAt: "desc" },
      select: { id: true, startedAt: true, completedAt: true, status: true },
    }),
  ]);

  // Aggregate per block
  const blockStats = page.blocks.map((block) => {
    const reviews = blockReviews.filter((br) => br.blockId === block.id);
    const approved = reviews.filter((br) => br.approved).length;
    const rejected = reviews.length - approved;
    const suggestions = reviews.filter((br) => !br.approved && br.suggestion).map((br) => ({
      suggestion: br.suggestion!,
      sessionId: br.session.id,
    }));
    const rate = reviews.length > 0 ? Math.round((approved / reviews.length) * 100) : null;
    return { block, reviews: reviews.length, approved, rejected, suggestions, rate };
  });

  const totalReviews = blockStats.reduce((a, b) => a + b.reviews, 0);
  const totalApproved = blockStats.reduce((a, b) => a + b.approved, 0);
  const totalRejected = totalReviews - totalApproved;
  const overallRate = totalReviews > 0 ? Math.round((totalApproved / totalReviews) * 100) : null;

  return (
    <div style={{ maxWidth: "860px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <Link href="/dashboard/strony" style={{ fontSize: "0.8125rem", color: "#A6B2CC", textDecoration: "none" }}>
          ← Strony
        </Link>
        <span style={{ fontSize: "0.8125rem", color: "#DDE3EE" }}>/</span>
        <Link href={`/dashboard/filary/${pillarSlug}`} style={{ fontSize: "0.8125rem", color: "#A6B2CC", textDecoration: "none" }}>
          {PILLAR_LABEL[pillarSlug] ?? pillarSlug}
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid #DDE3EE" }}>
        <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>
          STRONA · {PILLAR_LABEL[pillarSlug] ?? pillarSlug}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "1rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.03em", margin: 0 }}>
            {page.title}
          </h1>
          <a href={page.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.875rem", color: "#006D9E", textDecoration: "none" }}>
            {page.url} ↗
          </a>
        </div>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {[
            { label: "Bloków", value: page.blocks.length },
            { label: "Ocenionych bloków", value: totalReviews },
            { label: "Zatwierdzonych", value: totalApproved, accent: "#186B47" },
            { label: "Do zmiany", value: totalRejected, accent: totalRejected > 0 ? "#8E0055" : "#A6B2CC" },
            { label: "Akceptacja", value: overallRate !== null ? `${overallRate}%` : "—", accent: overallRate === null ? "#A6B2CC" : overallRate >= 70 ? "#186B47" : overallRate >= 40 ? "#7A5C00" : "#8E0055" },
            { label: "Sesji", value: sessions.length },
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
        scope="page"
        scopeId={scopeId}
        initialSummary={cachedSummary?.content}
        label="AI Synthesis — analiza strony"
      />

      {/* Block analysis */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", letterSpacing: "-0.01em", marginBottom: "1.25rem" }}>
          Analiza bloków
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {blockStats.map(({ block, reviews, approved, rejected, suggestions, rate }) => (
            <div
              key={block.id}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #DDE3EE",
                borderLeft: `3px solid ${rate === null ? "#DDE3EE" : rate >= 70 ? "#BBE5C7" : rate >= 40 ? "#F0D98C" : "#F2C4D8"}`,
              }}
            >
              {/* Block header */}
              <div style={{ padding: "0.875rem 1.125rem", borderBottom: "1px solid #F4F6FA" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC" }}>
                        {block.section}
                      </span>
                      <span style={{ fontSize: "0.625rem", color: "#DDE3EE" }}>·</span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#767171" }}>{block.label}</span>
                    </div>
                    <p style={{ fontSize: "0.9375rem", color: "#242F44", lineHeight: 1.7, margin: 0 }}>
                      {block.currentText}
                    </p>
                    {block.context && (
                      <p style={{ fontSize: "0.75rem", color: "#A6B2CC", marginTop: "0.375rem", fontStyle: "italic" }}>
                        {block.context}
                      </p>
                    )}
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0, minWidth: "80px" }}>
                    {rate !== null ? (
                      <span style={{ fontSize: "1.5rem", fontWeight: 300, color: rate >= 70 ? "#186B47" : rate >= 40 ? "#7A5C00" : "#8E0055", letterSpacing: "-0.025em" }}>
                        {rate}%
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.875rem", color: "#A6B2CC" }}>brak</span>
                    )}
                    {reviews > 0 && (
                      <div style={{ marginTop: "0.25rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "#186B47", fontWeight: 500 }}>✓ {approved}</span>
                        <span style={{ fontSize: "0.75rem", color: rejected > 0 ? "#8E0055" : "#A6B2CC", fontWeight: rejected > 0 ? 600 : 400 }}>✕ {rejected}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div style={{ padding: "0.875rem 1.125rem" }}>
                  <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8E0055", marginBottom: "0.625rem" }}>
                    Propozycje zmian ({suggestions.length})
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {suggestions.map(({ suggestion, sessionId }, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "0.625rem 0.875rem",
                          backgroundColor: "#FDFBFC",
                          borderLeft: "2px solid #E4C4D4",
                          display: "flex",
                          gap: "0.75rem",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <p style={{ fontSize: "0.875rem", color: "#3B3838", lineHeight: 1.65, margin: 0, flex: 1, whiteSpace: "pre-wrap" }}>
                          {suggestion}
                        </p>
                        <Link href={`/dashboard/review/${sessionId}`} style={{ fontSize: "0.6875rem", color: "#A6B2CC", textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}>
                          #{sessionId.slice(-5)} →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Sessions */}
      {sessions.length > 0 && (
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", letterSpacing: "-0.01em", marginBottom: "1rem" }}>
            Sesje dotykające tej strony ({sessions.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {sessions.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1.125rem",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DDE3EE",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.8125rem", color: "#242F44" }}>
                    {new Date(s.startedAt).toLocaleString("pl-PL", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                  </span>
                  <span style={{ fontSize: "0.6875rem", color: "#A6B2CC", marginLeft: "0.75rem", fontFamily: "monospace" }}>#{s.id.slice(-6)}</span>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: s.status === "COMPLETED" ? "#186B47" : "#7A5C00", backgroundColor: s.status === "COMPLETED" ? "#F0FDF4" : "#FFFBEB", padding: "0.125rem 0.5rem" }}>
                    {s.status === "COMPLETED" ? "Ukończona" : "W toku"}
                  </span>
                  <Link href={`/dashboard/review/${s.id}`} style={{ fontSize: "0.8125rem", color: "#006D9E", textDecoration: "none", fontWeight: 500 }}>
                    Otwórz →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
