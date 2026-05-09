"use client";

import { useState } from "react";

interface Props {
  scope: "session" | "pillar" | "page";
  scopeId: string;
  initialSummary?: string | null;
  label?: string;
}

export function AiSummaryBlock({ scope, scopeId, initialSummary, label = "AI Synthesis" }: Props) {
  const [summary, setSummary] = useState(initialSummary ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(force = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, scopeId, force }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Błąd generowania");
      setSummary(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #DDE3EE",
        borderLeft: "3px solid #006D9E",
        padding: "1.25rem 1.5rem",
        marginBottom: "2rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: summary ? "0.875rem" : 0 }}>
        <p
          style={{
            fontSize: "0.625rem",
            fontWeight: 600,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "#006D9E",
            margin: 0,
          }}
        >
          {label}
        </p>
        <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
          {summary && (
            <button
              onClick={() => generate(true)}
              disabled={loading}
              style={{
                fontSize: "0.6875rem",
                color: "#A6B2CC",
                background: "none",
                border: "none",
                cursor: loading ? "wait" : "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              {loading ? "Generuję…" : "Regeneruj"}
            </button>
          )}
          {!summary && (
            <button
              onClick={() => generate(false)}
              disabled={loading}
              style={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "#006D9E",
                background: "none",
                border: "1px solid #DDE3EE",
                cursor: loading ? "wait" : "pointer",
                padding: "0.375rem 0.875rem",
                letterSpacing: "0.02em",
              }}
            >
              {loading ? "Generuję…" : "Generuj synthesis →"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p style={{ fontSize: "0.8125rem", color: "#8E0055", margin: "0.5rem 0 0" }}>{error}</p>
      )}

      {loading && !summary && (
        <p style={{ fontSize: "0.875rem", color: "#A6B2CC", margin: "0.75rem 0 0", fontStyle: "italic" }}>
          Analizuję dane i generuję podsumowanie…
        </p>
      )}

      {summary && (
        <p
          style={{
            fontSize: "0.9375rem",
            color: "#3B3838",
            lineHeight: 1.75,
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {summary}
        </p>
      )}
    </div>
  );
}
