"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContentPillar } from "@/lib/content/contentDefinitions";
import { useContentReviewStore } from "@/stores/content-review-store";

const PILL_STYLES: Record<string, { bg: string; color: string }> = {
  wspolne: { bg: "#EFF6FF", color: "#1D4ED8" },
  doradztwo: { bg: "#F0FDF4", color: "#15803D" },
  edukacja: { bg: "#FFF7ED", color: "#B45309" },
  career: { bg: "#FAF5FF", color: "#7E22CE" },
};

export default function PillarStart({ pillar }: { pillar: ContentPillar }) {
  const router = useRouter();
  const { sessionId, pillarSlug, setSession, clearAll } = useContentReviewStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalBlocks = pillar.pages.reduce((acc, p) => acc + p.blocks.length, 0);
  const pill = PILL_STYLES[pillar.slug] ?? { bg: "#F8FAFC", color: "#242F44" };

  const hasExistingSession = sessionId && pillarSlug === pillar.slug;

  async function startNew() {
    setLoading(true);
    setError(null);
    clearAll();

    try {
      const res = await fetch("/api/content-review/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pillarSlug: pillar.slug }),
      });

      if (!res.ok) throw new Error("Błąd tworzenia sesji");
      const { data } = await res.json();
      setSession(data.id, pillar.slug);
      router.push(`/review/${pillar.slug}/${pillar.pages[0].slug}`);
    } catch {
      setError("Nie udało się rozpocząć review. Spróbuj ponownie.");
      setLoading(false);
    }
  }

  function continueSession() {
    router.push(`/review/${pillar.slug}/${pillar.pages[0].slug}`);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #DDE3EE", backgroundColor: "#FFFFFF", padding: "1.25rem 3rem" }}>
        <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A6B2CC", margin: 0 }}>
          PROFITIA · CONTENT REVIEW
        </p>
      </header>

      {/* Main */}
      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "4rem 2rem" }}>

        {/* Pillar badge */}
        <div style={{ marginBottom: "2rem" }}>
          <span style={{
            display: "inline-block",
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            padding: "0.25rem 0.625rem",
            backgroundColor: pill.bg,
            color: pill.color,
          }}>
            {pillar.name}
          </span>
        </div>

        <h1 style={{ fontSize: "2rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "1rem" }}>
          Przegląd treści<br />
          <span style={{ color: "#006D9E" }}>{pillar.name}</span>
        </h1>

        <p style={{ fontSize: "1rem", color: "#767171", lineHeight: 1.7, marginBottom: "2.5rem" }}>
          {pillar.description}
        </p>

        {/* Page overview */}
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.75rem" }}>
            Zakres przeglądu
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {pillar.pages.map((page, i) => (
              <div key={page.slug} style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.75rem 1rem", backgroundColor: "#FFFFFF", border: "1px solid #DDE3EE" }}>
                <span style={{ fontSize: "0.6875rem", fontWeight: 500, color: "#CAD2E3", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#242F44", margin: 0 }}>{page.title}</p>
                  <p style={{ fontSize: "0.75rem", color: "#A6B2CC", margin: "0.125rem 0 0" }}>{page.blocks.length} bloków treści</p>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#A6B2CC", flexShrink: 0 }}>{page.url.replace("https://profitia-pl.onrender.com", "")}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.75rem", color: "#A6B2CC", marginTop: "0.75rem" }}>
            Łącznie: {totalBlocks} bloków treści do oceny
          </p>
        </div>

        {/* What you'll do */}
        <div style={{ padding: "1.5rem", backgroundColor: "#FFFFFF", border: "1px solid #DDE3EE", marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "1rem" }}>
            Jak działa review
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              "Zobaczysz każdy blok treści z aktualnym tekstem.",
              "Dla każdego bloku: zatwierdź lub zaproponuj zmianę.",
              "Na końcu odpowiedz na 3 pytania ogólne o stronę.",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#006D9E", flexShrink: 0, paddingTop: "0.125rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p style={{ fontSize: "0.875rem", color: "#3B3838", lineHeight: 1.6, margin: 0 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p style={{ fontSize: "0.875rem", color: "#8E0055", marginBottom: "1rem" }}>{error}</p>
        )}

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {hasExistingSession && (
            <button
              onClick={continueSession}
              style={{ width: "100%", padding: "1rem", backgroundColor: "#FFFFFF", border: "1px solid #DDE3EE", fontSize: "0.9375rem", fontWeight: 500, color: "#242F44", cursor: "pointer", textAlign: "left" }}
            >
              Kontynuuj poprzedni review →
            </button>
          )}
          <button
            onClick={startNew}
            disabled={loading}
            style={{
              width: "100%",
              padding: "1rem 1.5rem",
              backgroundColor: loading ? "#CAD2E3" : "#242F44",
              border: "none",
              fontSize: "0.9375rem",
              fontWeight: 500,
              color: "#FFFFFF",
              cursor: loading ? "wait" : "pointer",
              letterSpacing: "0.01em",
            }}
          >
            {loading ? "Ładowanie..." : hasExistingSession ? "Zacznij od nowa" : "Rozpocznij review →"}
          </button>
        </div>

      </main>
    </div>
  );
}
