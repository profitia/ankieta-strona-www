import Link from "next/link";
import prisma from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · Sesje review — Profitia",
};

const statusLabel: Record<string, string> = {
  COMPLETED: "Ukończona",
  IN_PROGRESS: "W toku",
  PENDING: "Oczekuje",
};

const statusDot: Record<string, string> = {
  COMPLETED: "#186B47",
  IN_PROGRESS: "#7A5C00",
  PENDING: "#A6B2CC",
};

export default async function AdminReviewsPage() {
  const sessions = await prisma.reviewSession.findMany({
    include: {
      pillar: true,
      reviews: { select: { id: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        padding: "0 0 6rem",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #DDE3EE",
          backgroundColor: "#FFFFFF",
          padding: "1.5rem 3rem",
        }}
      >
        <p
          style={{
            fontSize: "0.6875rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#A6B2CC",
            marginBottom: "0.375rem",
          }}
        >
          PROFITIA · ADMIN
        </p>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 300,
            color: "#242F44",
            letterSpacing: "-0.025em",
          }}
        >
          Sesje review
        </h1>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 3rem 0" }}>
        {sessions.length === 0 ? (
          <p style={{ fontSize: "0.9375rem", color: "#767171" }}>
            Brak sesji w bazie danych.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Filar", "Rozpoczęta", "Ukończona", "Sekcje", "Status", "Powiadomienie", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0 0 0.625rem",
                      fontSize: "0.6875rem",
                      fontWeight: 500,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: "#A6B2CC",
                      textAlign: "left",
                      borderBottom: "1px solid #DDE3EE",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #F0F3F9" }}>
                  <td style={{ padding: "0.875rem 1rem 0.875rem 0", fontSize: "0.875rem", fontWeight: 500, color: "#242F44" }}>
                    {s.pillar.name}
                  </td>
                  <td style={{ padding: "0.875rem 1rem 0.875rem 0", fontSize: "0.8125rem", color: "#767171", whiteSpace: "nowrap" }}>
                    {new Date(s.startedAt).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </td>
                  <td style={{ padding: "0.875rem 1rem 0.875rem 0", fontSize: "0.8125rem", color: "#767171", whiteSpace: "nowrap" }}>
                    {s.completedAt
                      ? new Date(s.completedAt).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })
                      : "—"}
                  </td>
                  <td style={{ padding: "0.875rem 1rem 0.875rem 0", fontSize: "0.8125rem", color: "#767171", textAlign: "center" }}>
                    {s.reviews.length}
                  </td>
                  <td style={{ padding: "0.875rem 1rem 0.875rem 0" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontSize: "0.75rem",
                        color: statusDot[s.status],
                        fontWeight: 500,
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: statusDot[s.status],
                          flexShrink: 0,
                        }}
                      />
                      {statusLabel[s.status]}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem 0.875rem 0", fontSize: "0.8125rem" }}>
                    {s.status === "COMPLETED" ? (
                      <span style={{ color: s.notificationSent ? "#186B47" : "#8E0055", fontWeight: 500 }}>
                        {s.notificationSent ? "Wysłane" : "Nie wysłane"}
                      </span>
                    ) : (
                      <span style={{ color: "#A6B2CC" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "0.875rem 0", textAlign: "right" }}>
                    <Link
                      href={`/admin/reviews/${s.id}`}
                      style={{
                        fontSize: "0.75rem",
                        color: "#006D9E",
                        textDecoration: "none",
                        fontWeight: 500,
                        letterSpacing: "0.01em",
                      }}
                    >
                      Otwórz →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Session ID legend */}
        {sessions.length > 0 && (
          <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid #DDE3EE" }}>
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "#A6B2CC",
                marginBottom: "0.75rem",
              }}
            >
              Identyfikatory sesji
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {sessions.map((s) => (
                <div key={s.id} style={{ display: "flex", gap: "1rem", fontSize: "0.75rem" }}>
                  <span style={{ color: "#767171", flexShrink: 0 }}>{s.pillar.name}</span>
                  <span style={{ fontFamily: "monospace", color: "#A6B2CC" }}>{s.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
