"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FINAL_QUESTIONS, type ContentPillar } from "@/lib/content/contentDefinitions";
import { useContentReviewStore } from "@/stores/content-review-store";

export default function FinalReview({ pillar }: { pillar: ContentPillar }) {
  const router = useRouter();
  const { sessionId, finalAnswers, setFinalAnswer, clearAll } = useContentReviewStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!sessionId) {
      router.replace(`/review/${pillar.slug}`);
    }
    // Initialise comment inputs from store
    const init: Record<string, string> = {};
    FINAL_QUESTIONS.forEach((q) => {
      if (finalAnswers[q.id]?.comment) init[q.id] = finalAnswers[q.id].comment!;
    });
    setComments(init);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allAnswered = FINAL_QUESTIONS.every((q) => finalAnswers[q.id] !== undefined);

  function handleAnswer(questionId: string, approved: boolean) {
    setFinalAnswer(questionId, { approved, comment: comments[questionId] || undefined });
  }

  function handleComment(questionId: string, val: string) {
    setComments((prev) => ({ ...prev, [questionId]: val }));
    if (finalAnswers[questionId] !== undefined) {
      setFinalAnswer(questionId, { approved: finalAnswers[questionId].approved, comment: val || undefined });
    }
  }

  async function handleSubmit() {
    if (!sessionId || !allAnswered) return;
    setSubmitting(true);
    setError(null);

    try {
      // Save all final answers
      await Promise.all(
        FINAL_QUESTIONS.map((q) => {
          const answer = finalAnswers[q.id];
          if (!answer) return Promise.resolve();
          return fetch(`/api/content-review/sessions/${sessionId}/final`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionId: q.id,
              approved: answer.approved,
              comment: answer.comment ?? null,
            }),
          });
        })
      );

      // Mark complete (trigger email)
      const res = await fetch(`/api/content-review/sessions/${sessionId}/complete`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body?.details) {
          throw new Error(`Nieukończone: bloki ${body.details.blocks}, pytania ${body.details.final}`);
        }
        throw new Error("Błąd zakończenia sesji");
      }

      const completedId = sessionId;
      clearAll();
      router.push(`/review/${pillar.slug}/dziekujemy?session=${completedId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wystąpił błąd. Spróbuj ponownie.");
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", paddingBottom: "6rem" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #DDE3EE", backgroundColor: "#FFFFFF", padding: "1rem 2rem", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A6B2CC", margin: 0 }}>
            {pillar.name} · Pytania końcowe
          </p>
          <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#242F44", margin: "0.125rem 0 0" }}>Ogólna ocena strony</p>
        </div>
      </header>

      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "3rem 2rem" }}>
        <p style={{ fontSize: "1rem", color: "#767171", lineHeight: 1.7, marginBottom: "3rem" }}>
          Na koniec kilka pytań o całokształt strony. To Twoja perspektywa jako osoby znającej Profitię od środka.
        </p>

        {FINAL_QUESTIONS.map((q) => {
          const answer = finalAnswers[q.id];
          const showComment = answer?.approved === false;

          return (
            <div key={q.id} style={{
              marginBottom: "2rem",
              border: "1px solid #DDE3EE",
              backgroundColor: "#FFFFFF",
            }}>
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: showComment ? "1px solid #DDE3EE" : undefined }}>
                <p style={{ fontSize: "1rem", fontWeight: 500, color: "#242F44", lineHeight: 1.5, marginBottom: "1rem" }}>
                  {q.question}
                </p>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => handleAnswer(q.id, true)}
                    style={{
                      flex: 1,
                      padding: "0.625rem 1rem",
                      border: `1.5px solid ${answer?.approved === true ? "#186B47" : "#DDE3EE"}`,
                      backgroundColor: answer?.approved === true ? "#186B47" : "#FFFFFF",
                      color: answer?.approved === true ? "#FFFFFF" : "#767171",
                      fontSize: "0.875rem",
                      fontWeight: answer?.approved === true ? 600 : 400,
                      cursor: "pointer",
                    }}
                  >
                    ✅ Tak
                  </button>
                  <button
                    onClick={() => handleAnswer(q.id, false)}
                    style={{
                      flex: 1,
                      padding: "0.625rem 1rem",
                      border: `1.5px solid ${answer?.approved === false ? "#8E0055" : "#DDE3EE"}`,
                      backgroundColor: answer?.approved === false ? "#8E0055" : "#FFFFFF",
                      color: answer?.approved === false ? "#FFFFFF" : "#767171",
                      fontSize: "0.875rem",
                      fontWeight: answer?.approved === false ? 600 : 400,
                      cursor: "pointer",
                    }}
                  >
                    ❌ Nie
                  </button>
                </div>
              </div>

              {showComment && (
                <div style={{ padding: "1rem 1.5rem" }}>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8E0055", marginBottom: "0.5rem" }}>
                    {q.followUp}
                  </p>
                  <textarea
                    value={comments[q.id] ?? ""}
                    onChange={(e) => handleComment(q.id, e.target.value)}
                    placeholder="Twój komentarz..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid #F2C4D8",
                      borderBottom: "2px solid #8E0055",
                      backgroundColor: "#FDFBFC",
                      fontSize: "0.9375rem",
                      color: "#242F44",
                      lineHeight: 1.6,
                      resize: "vertical",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {error && (
          <p style={{ fontSize: "0.875rem", color: "#8E0055", marginBottom: "1rem" }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          style={{
            width: "100%",
            padding: "1rem 1.5rem",
            backgroundColor: allAnswered && !submitting ? "#242F44" : "#CAD2E3",
            border: "none",
            color: "#FFFFFF",
            fontSize: "0.9375rem",
            fontWeight: 500,
            cursor: allAnswered && !submitting ? "pointer" : "not-allowed",
            letterSpacing: "0.01em",
          }}
        >
          {submitting ? "Zapisywanie..." : "Zakończ review →"}
        </button>
      </main>
    </div>
  );
}
