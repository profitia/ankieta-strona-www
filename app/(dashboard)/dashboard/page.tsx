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

function fmt(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pl-PL", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
}

export default async function DashboardPage() {
  const [contentSessions, blockReviews, aiSummaries] = await Promise.all([
    prisma.contentSession.findMany({
      orderBy: { startedAt: "desc" },
      include: {
        blockReviews: { select: { id: true, approved: true, blockId: true } },
        finalAnswers: { select: { id: true } },
      },
    }),
    prisma.contentBlockReview.findMany({ select: { approved: true } }),
    prisma.aiSummary.findMany({ select: { id: true } }),
  ]);

  const completedSessions = contentSessions.filter((s) => s.status === "COMPLETED");
  const totalBlocks = blockReviews.length;
  const totalApproved = blockReviews.filter((b) => b.approved).length;
  const totalRejected = totalBlocks - totalApproved;
  const lastActivity = contentSessions[0]?.startedAt ?? null;

  const pillarStats = ALL_PILLARS.map((pillar) => {
    const pillarSessions = completedSessions.filter((s) => s.pillarSlug === pillar.slug);
    const pillarBlocks = pillarSessions.flatMap((s) => s.blockReviews);
    const pillarRejected = pillarBlocks.filter((b) => !b.approved).length;
    return {
      slug: pillar.slug,
      name: pillar.name,
      pages: pillar.pages.length,
      sessions: pillarSessions.length,
      blocks: pillarBlocks.length,
      rejected: pillarRejected,
    };
  });

  const recentSessions = contentSessions.slice(0, 8);

  return (
    <div style={{ maxWidth: "860px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>
          PROFITIA · CONTENT REVIEW
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.03em", margin: "0 0 0.5rem" }}>
          Przegląd
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#767171", margin: 0 }}>
          Strategiczne centrum analizy review contentowych
        </p>
      </div>

      {/* Global stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "0",
          backgroundColor: "#FFFFFF",
          border: "1px solid #DDE3EE",
          marginBottom: "2.5rem",
        }}
      >
        {[
          { label: "Ukończone review", value: completedSessions.length, accent: undefined },
          { label: "Ocen bloków", value: totalBlocks, accent: undefined },
          { label: "Zatwierdzone", value: totalApproved, accent: "#186B47" },
          { label: "Do zmiany", value: totalRejected, accent: totalRejected > 0 ? "#8E0055" : "#A6B2CC" },
          { label: "AI Synthesis", value: aiSummaries.length, accent: "#006D9E" },
        ].map(({ label, value, accent }, i, arr) => (
          <div
            key={label}
            style={{
              padding: "1.25rem 1.5rem",
              borderRight: i < arr.length - 1 ? "1px solid #DDE3EE" : "none",
            }}
          >
            <p style={{ fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC", margin: "0 0 0.375rem" }}>
              {label}
            </p>
            <p style={{ fontSize: "2rem", fontWeight: 200, color: accent ?? "#242F44", letterSpacing: "-0.04em", margin: 0, lineHeight: 1 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {lastActivity && (
        <p style={{ fontSize: "0.75rem", color: "#A6B2CC", marginTop: "-2rem", marginBottom: "2.5rem" }}>
          Ostatnia aktywność: {fmt(lastActivity)}
        </p>
      )}

      {/* Pillar breakdown */}
      <section style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", letterSpacing: "-0.01em", margin: 0 }}>
            Filary
          </h2>
          <Link href="/dashboard/filary" style={{ fontSize: "0.8125rem", color: "#006D9E", textDecoration: "none" }}>
            Wszystkie filary →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
          }}
        >
          {pillarStats.map((p) => (
            <Link
              key={p.slug}
              href={`/dashboard/filary/${p.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DDE3EE",
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", letterSpacing: "-0.01em" }}>
                    {PILLAR_LABEL[p.slug] ?? p.name}
                  </span>
                  {p.rejected > 0 && (
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8E0055", backgroundColor: "#FDF4F8", padding: "0.125rem 0.5rem" }}>
                      {p.rejected} zmian
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  {[
                    { label: "Review", value: p.sessions },
                    { label: "Stron", value: p.pages },
                    { label: "Ocen", value: p.blocks },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span style={{ display: "block", fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC" }}>
                        {label}
                      </span>
                      <span style={{ fontSize: "1.25rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.02em" }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Last sessions */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", letterSpacing: "-0.01em", margin: 0 }}>
            Ostatnie review
          </h2>
          <Link href="/dashboard/review" style={{ fontSize: "0.8125rem", color: "#006D9E", textDecoration: "none" }}>
            Wszystkie →
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "#A6B2CC" }}>Brak sesji.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {/* Column headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 70px 60px 90px 80px",
                gap: "0.75rem",
                padding: "0.5rem 1.125rem",
                borderBottom: "2px solid #DDE3EE",
              }}
            >
              {["Filar", "Rozpoczęta", "Bloków", "Zmian", "Status", ""].map((h) => (
                <span key={h} style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC" }}>
                  {h}
                </span>
              ))}
            </div>

            {recentSessions.map((s) => {
              const rejected = s.blockReviews.filter((b) => !b.approved).length;
              const isCompleted = s.status === "COMPLETED";
              return (
                <div
                  key={s.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 140px 70px 60px 90px 80px",
                    gap: "0.75rem",
                    padding: "0.75rem 1.125rem",
                    borderBottom: "1px solid #F0F3F9",
                    backgroundColor: "#FFFFFF",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#242F44" }}>
                      {PILLAR_LABEL[s.pillarSlug] ?? s.pillarSlug}
                    </span>
                    <span style={{ display: "block", fontSize: "0.625rem", color: "#CAD2E3", fontFamily: "monospace" }}>
                      #{s.id.slice(-5)}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.8125rem", color: "#767171" }}>{fmt(s.startedAt)}</span>
                  <span style={{ fontSize: "0.875rem", color: "#242F44" }}>{s.blockReviews.length}</span>
                  <span style={{ fontSize: "0.875rem", fontWeight: rejected > 0 ? 600 : 400, color: rejected > 0 ? "#8E0055" : "#A6B2CC" }}>
                    {rejected}
                  </span>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: isCompleted ? "#186B47" : "#7A5C00",
                      backgroundColor: isCompleted ? "#F0FDF4" : "#FFFBEB",
                      padding: "0.1875rem 0.5rem",
                      display: "inline-block",
                    }}
                  >
                    {isCompleted ? "Ukończona" : "W toku"}
                  </span>
                  <Link href={`/dashboard/review/${s.id}`} style={{ fontSize: "0.8125rem", color: "#006D9E", textDecoration: "none", fontWeight: 500 }}>
                    Otwórz →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
