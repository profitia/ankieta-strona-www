"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useReviewStore } from "@/stores/review-store";
import { useHydrated } from "@/hooks/useHydrated";
import { toast } from "sonner";

type SectionReview = {
  id: string;
  sectionId: string;
  clarityScore: number;
  businessScore: number;
  trustScore: number;
  designScore: number;
  ctaScore: number;
  severity: string;
  feedbackTypes: string[];
  problem: string;
  impact: string;
  suggestion: string;
  notes?: string | null;
  section: { id: string; name: string; slug: string };
};

type Session = {
  id: string;
  status: string;
  pillar: { name: string; slug: string };
  reviews: SectionReview[];
};

const SEVERITY_LABELS: Record<string, string> = {
  LOW: "Drobna uwaga",
  MEDIUM: "Średnio istotny",
  HIGH: "Wysoce istotny",
  CRITICAL: "Priorytet krytyczny",
};

const SEVERITY_DOT: Record<string, string> = {
  LOW: "#A6A6A6",
  MEDIUM: "#006D9E",
  HIGH: "#8E0055",
  CRITICAL: "#48103F",
};

const SCORE_LABELS = ["Jasność", "Wartość", "Zaufanie", "Design", "CTA"] as const;

function avgScore(review: SectionReview) {
  const sum =
    review.clarityScore +
    review.businessScore +
    review.trustScore +
    review.designScore +
    review.ctaScore;
  return (sum / 5).toFixed(1);
}

function getScores(review: SectionReview) {
  return [
    review.clarityScore,
    review.businessScore,
    review.trustScore,
    review.designScore,
    review.ctaScore,
  ];
}

function PodsumowanieContent() {
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get("sessionId");
  const hydrated = useHydrated();
  const { sessionId: storeSessionId, clearAll } = useReviewStore();

  const sessionId = sessionIdFromUrl ?? storeSessionId;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!hydrated || !sessionId) {
      setLoading(false);
      return;
    }

    fetch(`/api/reviews?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setSession(data.data ?? null);
      })
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, [hydrated, sessionId]);

  const handleComplete = async () => {
    if (!sessionId) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error();
      clearAll();
      window.location.href = "/dziekujemy";
    } catch {
      toast.error("Nie udało się zakończyć sesji. Spróbuj ponownie.");
      setCompleting(false);
    }
  };

  if (!hydrated || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
        <Loader2 style={{ width: "16px", height: "16px", color: "#CAD2E3", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!sessionId || !session) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "4rem 2rem", backgroundColor: "#FFFFFF" }}>
        <p style={{ fontSize: "0.9375rem", color: "#767171" }}>Nie znaleziono aktywnej sesji.</p>
        <Link href="/filar" style={{ fontSize: "0.875rem", color: "#006D9E", textDecoration: "none" }}>
          Wróć do wyboru filaru →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #DDE3EE",
          height: "48px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "680px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <nav style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <Link
              href={`/filar/${session.pillar.slug}`}
              style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#A6A6A6",
                textDecoration: "none",
                transition: "color 150ms",
              }}
              className="hover:text-navy"
            >
              ← Powót do sekcji
            </Link>
            <span style={{ margin: "0 0.875rem", color: "#D9D9D9", fontSize: "0.75rem" }}>·</span>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#242F44",
              }}
            >
              Podsumowanie
            </span>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "4rem 2rem 6rem" }}>

        {/* Page intro */}
        <div style={{ marginBottom: "3rem", paddingBottom: "2.5rem", borderBottom: "1px solid #DDE3EE" }}>
          <p className="label-procedural" style={{ marginBottom: "0.625rem" }}>Raport oceny</p>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 300,
              color: "#242F44",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: "0.625rem",
            }}
          >
            {session.pillar.name}
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "#A6A6A6", lineHeight: 1.7 }}>
            Oceniono{" "}
            <span style={{ color: "#242F44", fontWeight: 500 }}>{session.reviews.length}</span>{" "}
            {session.reviews.length === 1 ? "sekcję" : session.reviews.length < 5 ? "sekcje" : "sekcji"}.
          </p>
        </div>

        {/* Reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {session.reviews.map((review, index) => {
            const scores = getScores(review);
            const avg = avgScore(review);
            const dotColor = SEVERITY_DOT[review.severity] ?? "#A6A6A6";

            return (
              <div
                key={review.id}
                style={{
                  paddingBottom: "3rem",
                  marginBottom: "3rem",
                  borderBottom: "1px solid #EEF2F8",
                }}
              >
                {/* Review header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "1.75rem",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.875rem" }}>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        color: "#CAD2E3",
                        fontVariantNumeric: "tabular-nums",
                        flexShrink: 0,
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 400,
                        color: "#242F44",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.3,
                      }}
                    >
                      {review.section.name}
                    </h2>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: dotColor,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "0.75rem", color: "#767171", letterSpacing: "0.02em" }}>
                      {SEVERITY_LABELS[review.severity]}
                    </span>
                  </div>
                </div>

                {/* Scores grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "1px",
                    backgroundColor: "#DDE3EE",
                    border: "1px solid #DDE3EE",
                    marginBottom: "1.75rem",
                  }}
                >
                  {scores.map((val, i) => (
                    <div
                      key={SCORE_LABELS[i]}
                      style={{
                        backgroundColor: "#FFFFFF",
                        padding: "0.875rem 0.5rem",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 300,
                          color: val >= 4 ? "#006D9E" : val >= 3 ? "#242F44" : "#8E0055",
                          letterSpacing: "-0.025em",
                          lineHeight: 1,
                          marginBottom: "0.375rem",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {val}
                      </div>
                      <div
                        style={{
                          fontSize: "0.625rem",
                          fontWeight: 500,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: "#A6A6A6",
                        }}
                      >
                        {SCORE_LABELS[i]}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feedback types */}
                {review.feedbackTypes.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    {review.feedbackTypes.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 500,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: "#767171",
                          border: "1px solid #DDE3EE",
                          padding: "0.25rem 0.625rem",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Text feedback */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {[
                    { label: "Co jest niejasne lub problematyczne?", value: review.problem },
                    { label: "Dlaczego to może przeszkadzać odbiorcy?", value: review.impact },
                    { label: "Jak można to poprawić?", value: review.suggestion },
                    ...(review.notes ? [{ label: "Uwagi dodatkowe", value: review.notes }] : []),
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="label-procedural" style={{ marginBottom: "0.375rem" }}>
                        {label}
                      </p>
                      <p style={{ fontSize: "0.9375rem", color: "#3B3838", lineHeight: 1.75 }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Edit link */}
                <div style={{ marginTop: "1.5rem" }}>
                  <Link
                    href={`/filar/${session.pillar.slug}/${review.section.slug}`}
                    style={{
                      fontSize: "0.75rem",
                      color: "#CAD2E3",
                      textDecoration: "none",
                      letterSpacing: "0.04em",
                      transition: "color 150ms",
                    }}
                    className="hover:text-corp-blue"
                  >
                                Poprawić tę ocenę →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div
          style={{
            paddingTop: "2rem",
            borderTop: "1px solid #DDE3EE",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <button
            onClick={handleComplete}
            disabled={completing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: completing ? "#CAD2E3" : "#242F44",
              color: "#FFFFFF",
              fontSize: "0.875rem",
              fontWeight: 500,
              letterSpacing: "0.02em",
              border: "none",
              cursor: completing ? "not-allowed" : "pointer",
              transition: "background-color 150ms",
              alignSelf: "flex-start",
            }}
          >
            {completing && (
              <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />
            )}
                        Zakończ i przekaż ankietę
          </button>

          <Link
            href="/filar"
            style={{
              fontSize: "0.875rem",
              color: "#A6A6A6",
              textDecoration: "none",
              letterSpacing: "0.01em",
              transition: "color 150ms",
            }}
            className="hover:text-navy"
          >
                        Oceń inny obszar →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PodsumowaniePage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
          <Loader2 style={{ width: "16px", height: "16px", color: "#CAD2E3" }} />
        </div>
      }
    >
      <PodsumowanieContent />
    </Suspense>
  );
}
