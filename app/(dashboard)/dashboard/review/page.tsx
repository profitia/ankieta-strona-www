import Link from "next/link";
import prisma from "@/lib/prisma/client";

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

function duration(start: Date, end: Date | null): string {
  if (!end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return min > 0 ? `${min} min ${sec} s` : `${sec} s`;
}

export default async function ReviewListPage() {
  const sessions = await prisma.contentSession.findMany({
    orderBy: { startedAt: "desc" },
    include: {
      blockReviews: { select: { approved: true } },
      finalAnswers: { select: { id: true } },
    },
  });

  const completed = sessions.filter((s) => s.status === "COMPLETED");
  const inProgress = sessions.filter((s) => s.status === "IN_PROGRESS");

  return (
    <div style={{ maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>
          DASHBOARD · REVIEW
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.03em", margin: 0 }}>
          Lista review
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#767171", marginTop: "0.5rem" }}>
          {completed.length} ukończonych · {inProgress.length} w toku
        </p>
      </div>

      {sessions.length === 0 ? (
        <div style={{ padding: "3rem 2rem", textAlign: "center", border: "1px solid #DDE3EE", backgroundColor: "#FFFFFF" }}>
          <p style={{ fontSize: "0.9375rem", color: "#A6B2CC" }}>Brak sesji review w bazie danych.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 100px 60px 60px 80px 80px",
              gap: "1rem",
              padding: "0.5rem 1.25rem",
              borderBottom: "2px solid #DDE3EE",
            }}
          >
            {["Filar", "Rozpoczęta", "Czas", "Bloków", "Zmian", "Status", ""].map((h) => (
              <span
                key={h}
                style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC" }}
              >
                {h}
              </span>
            ))}
          </div>

          {sessions.map((s) => {
            const rejected = s.blockReviews.filter((b) => !b.approved).length;
            const isCompleted = s.status === "COMPLETED";

            return (
              <div
                key={s.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 100px 60px 60px 80px 80px",
                  gap: "1rem",
                  padding: "0.875rem 1.25rem",
                  borderBottom: "1px solid #F0F3F9",
                  backgroundColor: "#FFFFFF",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#242F44" }}>
                    {PILLAR_LABEL[s.pillarSlug] ?? s.pillarSlug}
                  </span>
                  <span style={{ display: "block", fontSize: "0.6875rem", color: "#CAD2E3", fontFamily: "monospace", marginTop: "0.125rem" }}>
                    #{s.id.slice(-6)}
                  </span>
                </div>
                <span style={{ fontSize: "0.8125rem", color: "#767171" }}>{fmt(s.startedAt)}</span>
                <span style={{ fontSize: "0.8125rem", color: "#767171" }}>{duration(s.startedAt, s.completedAt)}</span>
                <span style={{ fontSize: "0.8125rem", color: "#242F44" }}>{s.blockReviews.length}</span>
                <span style={{ fontSize: "0.8125rem", fontWeight: rejected > 0 ? 600 : 400, color: rejected > 0 ? "#8E0055" : "#A6B2CC" }}>
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
                <Link
                  href={`/dashboard/review/${s.id}`}
                  style={{ fontSize: "0.8125rem", color: "#006D9E", textDecoration: "none", fontWeight: 500 }}
                >
                  Otwórz →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
