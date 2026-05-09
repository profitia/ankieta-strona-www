import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma/client";
import { getPillar, getBlock, FINAL_QUESTIONS } from "@/lib/content/contentDefinitions";
import { AiSummaryBlock } from "@/components/dashboard/AiSummaryBlock";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ sessionId: string }> };

const PILLAR_LABEL: Record<string, string> = {
  wspolne: "Wspólne",
  doradztwo: "Doradztwo",
  edukacja: "Edukacja",
  career: "Kariera",
};

function fmt(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pl-PL", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
}

function duration(start: Date, end: Date | null): string {
  if (!end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return min > 0 ? `${min} min ${sec} s` : `${sec} s`;
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { sessionId } = await params;

  const [session, cachedSummary] = await Promise.all([
    prisma.contentSession.findUnique({
      where: { id: sessionId },
      include: {
        blockReviews: { orderBy: { createdAt: "asc" } },
        finalAnswers: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.aiSummary.findUnique({ where: { scope_scopeId: { scope: "session", scopeId: sessionId } } }),
  ]);

  if (!session) notFound();

  const pillar = getPillar(session.pillarSlug);
  const isCompleted = session.status === "COMPLETED";

  // Group block reviews by page
  const pageGroups: Array<{
    pageTitle: string;
    pageUrl: string;
    pageSlug: string;
    blocks: Array<{
      blockId: string;
      section: string;
      label: string;
      currentText: string;
      context?: string;
      approved: boolean;
      suggestion: string | null;
    }>;
  }> = [];

  if (pillar) {
    for (const page of pillar.pages) {
      const pageBlocks = session.blockReviews
        .filter((br) => page.blocks.some((b) => b.id === br.blockId))
        .map((br) => {
          const def = getBlock(br.blockId);
          return {
            blockId: br.blockId,
            section: def?.section ?? "—",
            label: def?.label ?? br.blockId,
            currentText: def?.currentText ?? "",
            context: def?.context,
            approved: br.approved,
            suggestion: br.suggestion,
          };
        });

      if (pageBlocks.length > 0) {
        pageGroups.push({ pageTitle: page.title, pageUrl: page.url, pageSlug: page.slug, blocks: pageBlocks });
      }
    }
  }

  const approvedCount = session.blockReviews.filter((b) => b.approved).length;
  const rejectedCount = session.blockReviews.length - approvedCount;

  return (
    <div style={{ maxWidth: "800px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/dashboard/review" style={{ fontSize: "0.8125rem", color: "#A6B2CC", textDecoration: "none" }}>
          ← Review
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid #DDE3EE" }}>
        <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>
          SESSION · {PILLAR_LABEL[session.pillarSlug] ?? session.pillarSlug}
        </p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.03em", margin: "0 0 1rem" }}>
          {PILLAR_LABEL[session.pillarSlug] ?? session.pillarSlug} — review sesja
        </h1>

        {/* Meta grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
          {[
            { label: "Session ID", value: `#${session.id.slice(-8)}`, mono: true },
            { label: "Rozpoczęta", value: fmt(session.startedAt) },
            { label: "Ukończona", value: fmt(session.completedAt) },
            { label: "Czas trwania", value: duration(session.startedAt, session.completedAt) },
            { label: "Zatwierdzone", value: `${approvedCount}/${session.blockReviews.length}`, accent: "#186B47" },
            { label: "Do zmiany", value: String(rejectedCount), accent: rejectedCount > 0 ? "#8E0055" : "#A6B2CC" },
            ...(session.ipAddress ? [{ label: "IP", value: session.ipAddress, mono: true }] : []),
            {
              label: "Status",
              value: isCompleted ? "UKOŃCZONA" : "W TOKU",
              accent: isCompleted ? "#186B47" : "#7A5C00",
            },
          ].map(({ label, value, mono, accent }) => (
            <div key={label}>
              <p style={{ fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC", margin: "0 0 0.125rem" }}>
                {label}
              </p>
              <p style={{ fontSize: "0.875rem", fontWeight: 500, color: accent ?? "#242F44", fontFamily: mono ? "monospace" : "inherit", margin: 0 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Synthesis */}
      <AiSummaryBlock
        scope="session"
        scopeId={sessionId}
        initialSummary={cachedSummary?.content}
        label="AI Synthesis — opinia reviewera"
      />

      {/* Block reviews */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", letterSpacing: "-0.01em", marginBottom: "1.5rem" }}>
          Odpowiedzi dosłowne
        </h2>

        {pageGroups.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "#A6B2CC" }}>Brak zapisanych ocen bloków.</p>
        ) : (
          pageGroups.map(({ pageTitle, pageUrl, pageSlug, blocks }) => (
            <div key={pageSlug} style={{ marginBottom: "2.5rem" }}>
              {/* Page header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.75rem",
                  padding: "0.625rem 1rem",
                  backgroundColor: "#F4F6FA",
                  borderLeft: "3px solid #242F44",
                  marginBottom: "0.75rem",
                }}
              >
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#242F44" }}>{pageTitle}</span>
                <a
                  href={pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.75rem", color: "#006D9E", textDecoration: "none" }}
                >
                  {pageUrl} ↗
                </a>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {blocks.map((block) => (
                  <div
                    key={block.blockId}
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: `1px solid ${block.approved ? "#BBE5C7" : "#F2C4D8"}`,
                    }}
                  >
                    {/* Block header */}
                    <div
                      style={{
                        padding: "0.625rem 1rem",
                        borderBottom: `1px solid ${block.approved ? "#EDF7F1" : "#FAE8EF"}`,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        backgroundColor: block.approved ? "#F6FEF9" : "#FDF4F8",
                      }}
                    >
                      <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC" }}>
                        {block.section}
                      </span>
                      <span style={{ fontSize: "0.625rem", color: "#DDE3EE" }}>·</span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#767171" }}>{block.label}</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: block.approved ? "#186B47" : "#8E0055",
                        }}
                      >
                        {block.approved ? "✓ TAK" : "✕ NIE"}
                      </span>
                    </div>

                    {/* Current text */}
                    <div style={{ padding: "0.875rem 1rem" }}>
                      <p style={{ fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>
                        Aktualny tekst na stronie
                      </p>
                      <p style={{ fontSize: "0.9375rem", color: "#242F44", lineHeight: 1.7, margin: 0 }}>
                        {block.currentText}
                      </p>
                      {block.context && (
                        <p style={{ fontSize: "0.75rem", color: "#A6B2CC", marginTop: "0.375rem", fontStyle: "italic" }}>{block.context}</p>
                      )}
                    </div>

                    {/* Suggestion if rejected */}
                    {!block.approved && (
                      <div
                        style={{
                          padding: "0.875rem 1rem",
                          borderTop: "1px solid #FAE8EF",
                          backgroundColor: "#FDFBFC",
                          borderLeft: "3px solid #8E0055",
                          marginLeft: "0",
                        }}
                      >
                        <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8E0055", marginBottom: "0.375rem" }}>
                          Propozycja zmiany
                        </p>
                        <p style={{ fontSize: "0.9375rem", color: "#3B3838", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                          {block.suggestion || <span style={{ color: "#A6B2CC", fontStyle: "italic" }}>Brak komentarza</span>}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Final questions */}
      {session.finalAnswers.length > 0 && (
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", letterSpacing: "-0.01em", marginBottom: "1.5rem" }}>
            Pytania końcowe
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {FINAL_QUESTIONS.map((q) => {
              const answer = session.finalAnswers.find((a) => a.questionId === q.id);
              if (!answer) return null;
              return (
                <div
                  key={q.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${answer.approved ? "#BBE5C7" : "#F2C4D8"}`,
                  }}
                >
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: answer.comment ? `1px solid ${answer.approved ? "#EDF7F1" : "#FAE8EF"}` : "none",
                      backgroundColor: answer.approved ? "#F6FEF9" : "#FDF4F8",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: answer.approved ? "#186B47" : "#8E0055",
                        flexShrink: 0,
                      }}
                    >
                      {answer.approved ? "✓ TAK" : "✕ NIE"}
                    </span>
                    <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#242F44", margin: 0, lineHeight: 1.4 }}>
                      {q.question}
                    </p>
                  </div>
                  {answer.comment && (
                    <div style={{ padding: "0.875rem 1rem", borderLeft: "3px solid #8E0055" }}>
                      <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8E0055", marginBottom: "0.375rem" }}>
                        Komentarz
                      </p>
                      <p style={{ fontSize: "0.9375rem", color: "#3B3838", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>
                        {answer.comment}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
