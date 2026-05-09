import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

const SEVERITY_LABELS: Record<string, string> = {
  LOW: "Drobna uwaga",
  MEDIUM: "Średnio istotny",
  HIGH: "Wysoce istotny",
  CRITICAL: "Priorytet krytyczny",
};

const SEVERITY_COLOR: Record<string, string> = {
  LOW: "#767171",
  MEDIUM: "#006D9E",
  HIGH: "#8E0055",
  CRITICAL: "#48103F",
};

const SCORE_DIMS = [
  { key: "clarityScore", label: "Jasność" },
  { key: "businessScore", label: "Wartość" },
  { key: "trustScore", label: "Zaufanie" },
  { key: "designScore", label: "Design" },
  { key: "ctaScore", label: "CTA" },
] as const;

function scoreColor(v: number): string {
  if (v >= 4) return "#186B47";
  if (v >= 3) return "#7A5C00";
  return "#8E0055";
}

type PageProps = { params: Promise<{ sessionId: string }> };

export default async function AdminReviewDetailPage({ params }: PageProps) {
  const { sessionId } = await params;

  const session = await prisma.reviewSession.findUnique({
    where: { id: sessionId },
    include: {
      pillar: true,
      reviews: {
        include: { section: true },
        orderBy: { section: { order: "asc" } },
      },
    },
  });

  if (!session) notFound();

  // Count all sessions from same IP for repeat-visit detection
  const ipSessionCount = session.ipAddress
    ? await prisma.reviewSession.count({ where: { ipAddress: session.ipAddress } })
    : null;

  const overallAvg =
    session.reviews.length > 0
      ? (
          session.reviews.reduce((acc, r) => {
            return acc + (r.clarityScore + r.businessScore + r.trustScore + r.designScore + r.ctaScore) / 5;
          }, 0) / session.reviews.length
        ).toFixed(1)
      : null;

  const dateFormatted = (d: Date) =>
    d.toLocaleString("pl-PL", {
      timeZone: "Europe/Warsaw",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", paddingBottom: "6rem" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #DDE3EE", backgroundColor: "#FFFFFF", padding: "1.5rem 3rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.875rem" }}>
            <Link
              href="/admin/reviews"
              style={{ fontSize: "0.75rem", color: "#A6B2CC", textDecoration: "none", letterSpacing: "0.04em" }}
            >
              ← Wszystkie sesje
            </Link>
            <span style={{ color: "#DDE3EE", fontSize: "0.75rem" }}>·</span>
            <span style={{ fontSize: "0.75rem", color: "#767171", fontFamily: "monospace" }}>{sessionId}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>
                PROFITIA · ADMIN · REVIEW
              </p>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.025em" }}>
                {session.pillar.name}
              </h1>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {overallAvg && (
                <p style={{ fontSize: "2rem", fontWeight: 300, color: scoreColor(parseFloat(overallAvg)), letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {overallAvg}<span style={{ fontSize: "0.875rem", color: "#A6B2CC" }}>/5</span>
                </p>
              )}
              <p style={{ fontSize: "0.6875rem", color: "#A6B2CC", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "0.25rem" }}>
                Średnia
              </p>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem" }}>

        {/* Meta */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", marginBottom: "3rem", paddingBottom: "2rem", borderBottom: "1px solid #DDE3EE" }}>
          <div>
            <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>Rozpoczęta</p>
            <p style={{ fontSize: "0.875rem", color: "#242F44" }}>{dateFormatted(new Date(session.startedAt))}</p>
          </div>
          {session.completedAt && (
            <div>
              <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>Ukończona</p>
              <p style={{ fontSize: "0.875rem", color: "#242F44" }}>{dateFormatted(new Date(session.completedAt))}</p>
            </div>
          )}
          <div>
            <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>Powiadomienie</p>
            <p style={{ fontSize: "0.875rem", color: session.notificationSent ? "#186B47" : "#8E0055", fontWeight: 500 }}>
              {session.notificationSent ? "Wysłane" : "Nie wysłane"}
              {session.notificationSentAt && (
                <span style={{ display: "block", fontSize: "0.75rem", color: "#767171", fontWeight: 400 }}>
                  {dateFormatted(new Date(session.notificationSentAt))}
                </span>
              )}
            </p>
          </div>
          {(session.ipAddress) && (
            <div>
              <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>IP</p>
              <p style={{ fontSize: "0.6875rem", fontFamily: "monospace", color: "#CAD2E3", margin: 0 }}>
                {session.ipAddress}
                {ipSessionCount && ipSessionCount > 1 && (
                  <span style={{ marginLeft: "0.5rem", color: "#8E0055", fontFamily: "inherit", fontWeight: 600 }}>
                    · {ipSessionCount} sesji z tego IP
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Export links */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
          <a
            href={`/api/sessions/${sessionId}/export?format=json`}
            style={{ fontSize: "0.75rem", color: "#006D9E", textDecoration: "none", fontWeight: 500, letterSpacing: "0.02em" }}
          >
            Eksport JSON ↓
          </a>
          <a
            href={`/api/sessions/${sessionId}/export?format=csv`}
            style={{ fontSize: "0.75rem", color: "#006D9E", textDecoration: "none", fontWeight: 500, letterSpacing: "0.02em" }}
          >
            Eksport CSV ↓
          </a>
        </div>

        {/* Reviews */}
        {session.reviews.length === 0 ? (
          <p style={{ fontSize: "0.9375rem", color: "#767171" }}>Brak zapisanych ocen dla tej sesji.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {session.reviews.map((review, idx) => {
              const sectionAvg = ((review.clarityScore + review.businessScore + review.trustScore + review.designScore + review.ctaScore) / 5).toFixed(1);
              return (
                <div
                  key={review.id}
                  style={{ paddingBottom: "3rem", marginBottom: "3rem", borderBottom: "1px solid #EEF2F8" }}
                >
                  {/* Section header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#CAD2E3", fontVariantNumeric: "tabular-nums" }}>
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <h2 style={{ fontSize: "1.125rem", fontWeight: 400, color: "#242F44", letterSpacing: "-0.02em" }}>
                        {review.section.name}
                      </h2>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                      <span
                        style={{ fontSize: "0.75rem", color: SEVERITY_COLOR[review.severity], fontWeight: 500 }}
                      >
                        {SEVERITY_LABELS[review.severity]}
                      </span>
                      <span
                        style={{ fontSize: "1.25rem", fontWeight: 300, color: scoreColor(parseFloat(sectionAvg)), letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}
                      >
                        {sectionAvg}
                      </span>
                    </div>
                  </div>

                  {/* Score grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: "1px",
                      backgroundColor: "#DDE3EE",
                      border: "1px solid #DDE3EE",
                      marginBottom: "1.5rem",
                    }}
                  >
                    {SCORE_DIMS.map((dim) => {
                      const val = review[dim.key];
                      return (
                        <div key={dim.key} style={{ backgroundColor: "#FFFFFF", padding: "0.75rem 0.5rem", textAlign: "center" }}>
                          <div style={{ fontSize: "1.25rem", fontWeight: 300, color: scoreColor(val), letterSpacing: "-0.025em", lineHeight: 1, marginBottom: "0.25rem", fontVariantNumeric: "tabular-nums" }}>
                            {val}
                          </div>
                          <div style={{ fontSize: "0.5625rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6A6A6" }}>
                            {dim.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback types */}
                  {review.feedbackTypes.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                      {review.feedbackTypes.map((t) => (
                        <span
                          key={t}
                          style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "#767171", border: "1px solid #DDE3EE", padding: "0.25rem 0.5rem" }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Text fields */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {[
                      { label: "Problem", value: review.problem },
                      { label: "Wpływ na odbiorcę", value: review.impact },
                      { label: "Rekomendacja", value: review.suggestion },
                      ...(review.notes ? [{ label: "Uwagi dodatkowe", value: review.notes }] : []),
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>
                          {label}
                        </p>
                        <p style={{ fontSize: "0.9375rem", color: "#3B3838", lineHeight: 1.75 }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
