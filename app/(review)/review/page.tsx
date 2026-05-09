import Link from "next/link";
import { ALL_PILLARS } from "@/lib/content/contentDefinitions";

const PILL_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  wspolne: { bg: "#EFF6FF", color: "#1D4ED8", label: "Strony wspólne" },
  doradztwo: { bg: "#F0FDF4", color: "#15803D", label: "Doradztwo zakupowe" },
  edukacja: { bg: "#FFF7ED", color: "#B45309", label: "Edukacja zakupowa" },
  career: { bg: "#FAF5FF", color: "#7E22CE", label: "Kariera" },
};

export default function ReviewLandingPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #DDE3EE", backgroundColor: "#FFFFFF", padding: "1.25rem 3rem" }}>
        <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A6B2CC", margin: 0 }}>
          PROFITIA · CONTENT REVIEW
        </p>
      </header>

      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "4rem 2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "0.75rem" }}>
          Przegląd treści<br />profitia.pl
        </h1>
        <p style={{ fontSize: "1rem", color: "#767171", lineHeight: 1.7, marginBottom: "3rem" }}>
          Wybierz obszar, który chcesz przejrzeć. Dla każdego bloku treści podejmiesz prostą decyzję: zostaje tak jak jest, albo wymaga zmiany.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
          {ALL_PILLARS.map((pillar) => {
            const pill = PILL_STYLES[pillar.slug] ?? { bg: "#F8FAFC", color: "#242F44", label: pillar.name };
            const totalBlocks = pillar.pages.reduce((acc, p) => acc + p.blocks.length, 0);

            return (
              <Link
                key={pillar.slug}
                href={`/review/${pillar.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DDE3EE",
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.25rem",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
                      <span style={{
                        fontSize: "0.625rem",
                        fontWeight: 600,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        padding: "0.2rem 0.5rem",
                        backgroundColor: pill.bg,
                        color: pill.color,
                      }}>
                        {pill.label}
                      </span>
                    </div>
                    <p style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", margin: "0 0 0.25rem" }}>{pillar.name}</p>
                    <p style={{ fontSize: "0.8125rem", color: "#A6B2CC", margin: 0 }}>
                      {pillar.pages.length} {pillar.pages.length === 1 ? "strona" : pillar.pages.length < 5 ? "strony" : "stron"} · {totalBlocks} bloków treści
                    </p>
                  </div>
                  <span style={{ fontSize: "1.25rem", color: "#CAD2E3" }}>→</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div style={{ padding: "1.25rem 1.5rem", backgroundColor: "#FFFFFF", border: "1px solid #DDE3EE" }}>
          <p style={{ fontSize: "0.8125rem", color: "#767171", lineHeight: 1.7, margin: 0 }}>
            Każdy obszar możesz przeglądać niezależnie. Review zapisuje się automatycznie — możesz przerwać i wrócić.
          </p>
        </div>
      </main>
    </div>
  );
}
