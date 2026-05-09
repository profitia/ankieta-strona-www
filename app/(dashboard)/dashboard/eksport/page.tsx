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

export default async function EksportPage() {
  const sessionCounts = await prisma.contentSession.groupBy({
    by: ["pillarSlug", "status"],
    _count: { id: true },
  });

  const pillarCounts = ALL_PILLARS.map((p) => ({
    slug: p.slug,
    completed: sessionCounts
      .filter((g) => g.pillarSlug === p.slug && g.status === "COMPLETED")
      .reduce((acc, g) => acc + g._count.id, 0),
    all: sessionCounts
      .filter((g) => g.pillarSlug === p.slug)
      .reduce((acc, g) => acc + g._count.id, 0),
  }));

  return (
    <div style={{ maxWidth: "780px" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.375rem" }}>
          DASHBOARD · EKSPORT
        </p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.03em", margin: 0 }}>
          Eksport danych
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#767171", marginTop: "0.5rem" }}>
          Pobierz pełne dane review dla dalszej analizy lub archiwizacji
        </p>
      </div>

      {/* Export format explanation */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #DDE3EE",
          borderLeft: "3px solid #006D9E",
          padding: "1.25rem 1.5rem",
          marginBottom: "2rem",
        }}
      >
        <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#006D9E", marginBottom: "0.5rem" }}>
          Format eksportu
        </p>
        <p style={{ fontSize: "0.875rem", color: "#767171", lineHeight: 1.65, margin: 0 }}>
          Eksport zwraca dane JSON zawierające wszystkie ukończone sesje wraz z pełnymi odpowiedziami (TAK/NIE + propozycje zmian dla każdego bloku oraz pytania końcowe).
          Plik może być otwarty w Excelu, Notions lub zaimportowany do dalszych narzędzi analitycznych.
        </p>
      </div>

      {/* All sessions export */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #DDE3EE",
          padding: "1.5rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
      >
        <div>
          <p style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", margin: "0 0 0.25rem", letterSpacing: "-0.01em" }}>
            Wszystkie sesje — pełny eksport
          </p>
          <p style={{ fontSize: "0.8125rem", color: "#767171", margin: 0 }}>
            {pillarCounts.reduce((acc, p) => acc + p.completed, 0)} ukończonych sesji ze wszystkich filarów
          </p>
        </div>
        <a
          href="/api/export/content-reviews"
          download="content-reviews-all.json"
          style={{
            padding: "0.625rem 1.25rem",
            backgroundColor: "#242F44",
            color: "#FFFFFF",
            fontSize: "0.875rem",
            fontWeight: 500,
            textDecoration: "none",
            letterSpacing: "0.01em",
            flexShrink: 0,
          }}
        >
          Pobierz JSON ↓
        </a>
      </div>

      {/* Per-pillar exports */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {pillarCounts.map(({ slug, completed }) => (
          <div
            key={slug}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #DDE3EE",
              padding: "1rem 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <span style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#242F44", minWidth: "100px" }}>
                {PILLAR_LABEL[slug] ?? slug}
              </span>
              <span style={{ fontSize: "0.8125rem", color: "#A6B2CC" }}>
                {completed} {completed === 1 ? "sesja" : completed < 5 ? "sesje" : "sesji"} ukończonych
              </span>
            </div>
            <a
              href={`/api/export/content-reviews?pillar=${slug}`}
              download={`content-reviews-${slug}.json`}
              style={{
                padding: "0.375rem 0.875rem",
                border: "1px solid #DDE3EE",
                color: "#006D9E",
                fontSize: "0.8125rem",
                fontWeight: 500,
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              Pobierz ↓
            </a>
          </div>
        ))}
      </div>

      {/* Note */}
      <p style={{ fontSize: "0.75rem", color: "#A6B2CC", marginTop: "1.5rem", lineHeight: 1.5 }}>
        Eksport nie zawiera sesji w toku (status IN_PROGRESS). Pliki JSON zawierają: ID sesji, filar, IP, znaczniki czasu, wyniki bloków i pytania końcowe.
      </p>
    </div>
  );
}
