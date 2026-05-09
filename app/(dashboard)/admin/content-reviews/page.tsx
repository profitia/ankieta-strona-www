import { notFound } from "next/navigation";
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
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
}

export default async function ContentReviewsListPage() {
  const sessions = await prisma.contentSession.findMany({
    orderBy: { startedAt: "desc" },
    include: { blockReviews: true, finalAnswers: true },
  });

  // IP count map
  const ipCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    if (s.ipAddress) ipCounts[s.ipAddress] = (ipCounts[s.ipAddress] ?? 0) + 1;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", padding: "0 0 4rem" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #DDE3EE", backgroundColor: "#FFFFFF", padding: "1.5rem 3rem" }}>
        <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A6B2CC", margin: "0 0 0.25rem" }}>
          ADMIN PANEL
        </p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.02em", margin: 0 }}>
          Content Review — sesje
        </h1>
      </div>

      {/* Nav */}
      <div style={{ borderBottom: "1px solid #DDE3EE", backgroundColor: "#FFFFFF", padding: "0 3rem" }}>
        <div style={{ display: "flex", gap: "0" }}>
          {[
            { label: "Content Review", href: "/admin/content-reviews" },
            { label: "Full Review (UX)", href: "/admin/reviews" },
          ].map((tab) => (
            <Link key={tab.href} href={tab.href} style={{ padding: "0.75rem 1.25rem", fontSize: "0.8125rem", fontWeight: 500, color: tab.href === "/admin/content-reviews" ? "#006D9E" : "#A6B2CC", textDecoration: "none", borderBottom: tab.href === "/admin/content-reviews" ? "2px solid #006D9E" : "2px solid transparent" }}>
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ padding: "2rem 3rem" }}>
        {sessions.length === 0 ? (
          <p style={{ color: "#A6B2CC", fontSize: "0.875rem" }}>Brak sesji.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #DDE3EE" }}>
                {["Obszar", "Rozpoczęta", "Ukończona", "Bloki", "Zatw.", "Odrzuc.", "IP", "Status"].map((h) => (
                  <th key={h} style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC", padding: "0.625rem 0.875rem", textAlign: "left" }}>{h}</th>
                ))}
                <th style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC", padding: "0.625rem 0.875rem", textAlign: "left" }}>Otwórz</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const approved = s.blockReviews.filter((b) => b.approved).length;
                const rejected = s.blockReviews.length - approved;
                const ipCount = s.ipAddress ? (ipCounts[s.ipAddress] ?? 1) : 1;
                const isCompleted = s.status === "COMPLETED";

                return (
                  <tr key={s.id} style={{ borderBottom: "1px solid #F0F3F9" }}>
                    <td style={{ padding: "0.75rem 0.875rem", fontSize: "0.875rem", fontWeight: 500, color: "#242F44" }}>
                      {PILLAR_LABEL[s.pillarSlug] ?? s.pillarSlug}
                    </td>
                    <td style={{ padding: "0.75rem 0.875rem", fontSize: "0.8125rem", color: "#767171" }}>{fmt(s.startedAt)}</td>
                    <td style={{ padding: "0.75rem 0.875rem", fontSize: "0.8125rem", color: "#767171" }}>{fmt(s.completedAt)}</td>
                    <td style={{ padding: "0.75rem 0.875rem", fontSize: "0.8125rem", color: "#242F44" }}>{s.blockReviews.length}</td>
                    <td style={{ padding: "0.75rem 0.875rem", fontSize: "0.8125rem", fontWeight: 600, color: "#186B47" }}>{approved}</td>
                    <td style={{ padding: "0.75rem 0.875rem", fontSize: "0.8125rem", fontWeight: rejected > 0 ? 600 : 400, color: rejected > 0 ? "#8E0055" : "#A6B2CC" }}>{rejected}</td>
                    <td style={{ padding: "0.75rem 0.875rem", fontSize: "0.6875rem", color: "#A6B2CC", fontFamily: "monospace" }}>
                      {s.ipAddress ?? "—"}
                      {ipCount > 1 && <span style={{ fontSize: "0.625rem", marginLeft: "0.25rem", color: "#8E0055", fontFamily: "inherit" }}>×{ipCount}</span>}
                    </td>
                    <td style={{ padding: "0.75rem 0.875rem" }}>
                      <span style={{
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        padding: "0.2rem 0.5rem",
                        backgroundColor: isCompleted ? "#F0FDF4" : "#FFFBEB",
                        color: isCompleted ? "#186B47" : "#7A5C00",
                      }}>
                        {isCompleted ? "UKOŃCZONA" : "W TOKU"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 0.875rem" }}>
                      <Link href={`/admin/content-reviews/${s.id}`} style={{ fontSize: "0.8125rem", color: "#006D9E", textDecoration: "none", fontWeight: 500 }}>
                        Otwórz →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
