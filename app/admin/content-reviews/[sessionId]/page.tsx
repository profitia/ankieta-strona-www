import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma/client";
import { getPillar, getBlock, FINAL_QUESTIONS } from "@/lib/content/contentDefinitions";

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
  return new Date(d).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
}

export default async function ContentReviewDetailPage({ params }: PageProps) {
  const { sessionId } = await params;
  const session = await prisma.contentSession.findUnique({
    where: { id: sessionId },
    include: {
      blockReviews: { orderBy: { createdAt: "asc" } },
      finalAnswers: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!session) notFound();

  const pillar = getPillar(session.pillarSlug);
  const isCompleted = session.status === "COMPLETED";
  const approvedCount = session.blockReviews.filter((b) => b.approved).length;
  const rejectedCount = session.blockReviews.length - approvedCount;

  // Group blocks by page
  const blocksByPage: Array<{ pageTitle: string; pageUrl: string; blocks: typeof session.blockReviews }> = [];
  if (pillar) {
    for (const page of pillar.pages) {
      const pageBlocks = session.blockReviews.filter((br) =>
        page.blocks.some((pb) => pb.id === br.blockId)
      );
      if (pageBlocks.length > 0) {
        blocksByPage.push({ pageTitle: page.title, pageUrl: page.url, blocks: pageBlocks });
      }
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", padding: "0 0 4rem" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #DDE3EE", backgroundColor: "#FFFFFF", padding: "1.5rem 3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.375rem" }}>
          <Link href="/admin/content-reviews" style={{ fontSize: "0.8125rem", color: "#A6B2CC", textDecoration: "none" }}>
            ← Content Reviews
          </Link>
        </div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.02em", margin: 0 }}>
          {PILLAR_LABEL[session.pillarSlug] ?? session.pillarSlug} — sesja review
        </h1>
      </div>

      <div style={{ padding: "2rem 3rem" }}>

        {/* Meta grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          {[
            { label: "Obszar", value: PILLAR_LABEL[session.pillarSlug] ?? session.pillarSlug },
            { label: "Rozpoczęta", value: fmt(session.startedAt) },
            { label: "Ukończona", value: fmt(session.completedAt) },
            { label: "Status", value: isCompleted ? "UKOŃCZONA" : "W TOKU" },
            { label: "Bloki zatwierdzone", value: String(approvedCount), accent: "#186B47" },
            { label: "Bloki do zmiany", value: String(rejectedCount), accent: rejectedCount > 0 ? "#8E0055" : undefined },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{ backgroundColor: "#FFFFFF", border: "1px solid #DDE3EE", padding: "1rem 1.25rem" }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC", margin: "0 0 0.25rem" }}>{label}</p>
              <p style={{ fontSize: "1rem", fontWeight: 500, color: accent ?? "#242F44", margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Geo */}
        {(session.city || session.country || session.ipAddress) && (
          <div style={{ marginBottom: "2.5rem", backgroundColor: "#FFFFFF", border: "1px solid #DDE3EE", padding: "1rem 1.25rem", display: "inline-block" }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC", margin: "0 0 0.25rem" }}>Lokalizacja</p>
            <p style={{ fontSize: "0.875rem", color: "#242F44", margin: 0 }}>
              {[session.city, session.country].filter(Boolean).join(", ")}
              {session.ipAddress && (
                <span style={{ fontSize: "0.75rem", color: "#A6B2CC", fontFamily: "monospace", marginLeft: "0.75rem" }}>{session.ipAddress}</span>
              )}
            </p>
          </div>
        )}

        {/* Block decisions by page */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", letterSpacing: "-0.01em", marginBottom: "1.25rem" }}>
            Oceny bloków treści
          </h2>

          {blocksByPage.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "#A6B2CC" }}>Brak zapisanych ocen bloków.</p>
          ) : (
            blocksByPage.map(({ pageTitle, pageUrl, blocks }) => (
              <div key={pageTitle} style={{ marginBottom: "2rem" }}>
                <div style={{ padding: "0.625rem 1rem", backgroundColor: "#F0F3F9", borderLeft: "3px solid #006D9E", marginBottom: "0.5rem" }}>
                  <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#242F44", margin: 0 }}>{pageTitle}</p>
                  <a href={pageUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "#006D9E", textDecoration: "none" }}>{pageUrl} ↗</a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {blocks.map((br) => {
                    const blockDef = getBlock(br.blockId);
                    return (
                      <div key={br.blockId} style={{
                        display: "flex",
                        gap: "1rem",
                        padding: "0.875rem 1rem",
                        backgroundColor: "#FFFFFF",
                        border: `1px solid ${br.approved ? "#BBE5C7" : "#F2C4D8"}`,
                        alignItems: "flex-start",
                      }}>
                        <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "0.125rem" }}>{br.approved ? "✅" : "❌"}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#767171", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem" }}>
                            {blockDef?.section ?? "—"} · {blockDef?.label ?? br.blockId}
                          </p>
                          <p style={{ fontSize: "0.875rem", color: "#3B3838", lineHeight: 1.5, margin: 0 }}>
                            {blockDef?.currentText ?? <span style={{ color: "#A6B2CC" }}>(brak definicji)</span>}
                          </p>
                          {br.suggestion && (
                            <div style={{ marginTop: "0.625rem", padding: "0.625rem 0.875rem", backgroundColor: "#FDF4F8", borderLeft: "2px solid #8E0055" }}>
                              <p style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8E0055", margin: "0 0 0.25rem" }}>Propozycja zmiany</p>
                              <p style={{ fontSize: "0.875rem", color: "#242F44", lineHeight: 1.5, margin: 0 }}>{br.suggestion}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Final answers */}
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", letterSpacing: "-0.01em", marginBottom: "1.25rem" }}>
            Pytania końcowe
          </h2>
          {session.finalAnswers.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "#A6B2CC" }}>Brak odpowiedzi na pytania końcowe.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {FINAL_QUESTIONS.map((q) => {
                const answer = session.finalAnswers.find((a) => a.questionId === q.id);
                if (!answer) return null;
                return (
                  <div key={q.id} style={{
                    padding: "1rem 1.25rem",
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${answer.approved ? "#BBE5C7" : "#F2C4D8"}`,
                  }}>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "1rem", flexShrink: 0 }}>{answer.approved ? "✅" : "❌"}</span>
                      <div>
                        <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#242F44", margin: "0 0 0.25rem", lineHeight: 1.4 }}>{q.question}</p>
                        {answer.comment && (
                          <p style={{ fontSize: "0.875rem", color: "#767171", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
                            „{answer.comment}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
