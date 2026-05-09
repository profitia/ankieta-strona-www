"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ContentPillar, ContentPage, ContentBlock } from "@/lib/content/contentDefinitions";
import { useContentReviewStore, type BlockDecision } from "@/stores/content-review-store";

interface Props {
  pillar: ContentPillar;
  page: ContentPage;
  pageIndex: number;
  totalPages: number;
  nextPageSlug: string | null;
}

function BlockCard({
  block,
  decision,
  onDecide,
  saving,
}: {
  block: ContentBlock;
  decision: BlockDecision | undefined;
  onDecide: (blockId: string, decision: BlockDecision) => void;
  saving: boolean;
}) {
  const [showEditor, setShowEditor] = useState(decision?.approved === false);
  const [suggestion, setSuggestion] = useState(decision?.suggestion ?? "");

  function handleApprove() {
    setShowEditor(false);
    onDecide(block.id, { approved: true, suggestion: undefined });
  }

  function handleReject() {
    setShowEditor(true);
    onDecide(block.id, { approved: false, suggestion: suggestion || undefined });
  }

  function handleSuggestionChange(val: string) {
    setSuggestion(val);
    if (decision?.approved === false) {
      onDecide(block.id, { approved: false, suggestion: val || undefined });
    }
  }

  const isApproved = decision?.approved === true;
  const isRejected = decision?.approved === false;

  return (
    <div style={{
      border: `1px solid ${isApproved ? "#BBE5C7" : isRejected ? "#F2C4D8" : "#DDE3EE"}`,
      backgroundColor: isApproved ? "#F6FEF9" : isRejected ? "#FDF4F8" : "#FFFFFF",
      marginBottom: "1.5rem",
      transition: "border-color 0.15s, background-color 0.15s",
    }}>
      {/* Block header */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${isApproved ? "#BBE5C7" : isRejected ? "#F2C4D8" : "#DDE3EE"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC" }}>
            {block.section}
          </span>
          <span style={{ fontSize: "0.625rem", color: "#DDE3EE" }}>·</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#767171" }}>{block.label}</span>
        </div>
      </div>

      {/* Current text */}
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${isApproved ? "#BBE5C7" : isRejected ? "#F2C4D8" : "#DDE3EE"}` }}>
        <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.5rem" }}>
          Aktualny tekst
        </p>
        <p style={{ fontSize: "1rem", color: "#242F44", lineHeight: 1.65, margin: 0, fontStyle: "normal" }}>
          {block.currentText}
        </p>
        {block.context && (
          <p style={{ fontSize: "0.75rem", color: "#A6B2CC", marginTop: "0.5rem", fontStyle: "italic" }}>
            Uwaga: {block.context}
          </p>
        )}
      </div>

      {/* Decision question */}
      <div style={{ padding: "1.25rem 1.5rem" }}>
        <p style={{ fontSize: "0.875rem", color: "#3B3838", marginBottom: "0.875rem", fontWeight: 500 }}>
          Czy ten tekst może pozostać?
        </p>
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: showEditor ? "1rem" : 0 }}>
          <button
            onClick={handleApprove}
            disabled={saving}
            style={{
              flex: 1,
              padding: "0.6875rem 1rem",
              border: `1.5px solid ${isApproved ? "#186B47" : "#DDE3EE"}`,
              backgroundColor: isApproved ? "#186B47" : "#FFFFFF",
              color: isApproved ? "#FFFFFF" : "#767171",
              fontSize: "0.875rem",
              fontWeight: isApproved ? 600 : 400,
              cursor: saving ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.1s",
            }}
          >
            <span style={{ fontSize: "1rem" }}>✅</span> Tak — może pozostać
          </button>
          <button
            onClick={handleReject}
            disabled={saving}
            style={{
              flex: 1,
              padding: "0.6875rem 1rem",
              border: `1.5px solid ${isRejected ? "#8E0055" : "#DDE3EE"}`,
              backgroundColor: isRejected ? "#8E0055" : "#FFFFFF",
              color: isRejected ? "#FFFFFF" : "#767171",
              fontSize: "0.875rem",
              fontWeight: isRejected ? 600 : 400,
              cursor: saving ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.1s",
            }}
          >
            <span style={{ fontSize: "1rem" }}>❌</span> Nie — wymaga zmiany
          </button>
        </div>

        {/* Textarea when rejected */}
        {showEditor && (
          <div style={{ animation: "fadeIn 0.15s ease" }}>
            <p style={{ fontSize: "0.6875rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8E0055", marginBottom: "0.5rem" }}>
              Proponowana zmiana lub komentarz
            </p>
            <textarea
              value={suggestion}
              onChange={(e) => handleSuggestionChange(e.target.value)}
              placeholder="Wpisz nową wersję tekstu lub opisz co warto zmienić..."
              rows={4}
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
    </div>
  );
}

export default function PageReview({ pillar, page, pageIndex, totalPages, nextPageSlug }: Props) {
  const router = useRouter();
  const { sessionId, decisions, setDecision, markBlockSaved } = useContentReviewStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard: redirect to start if no session
  useEffect(() => {
    if (!sessionId) {
      router.replace(`/review/${pillar.slug}`);
    }
  }, [sessionId, pillar.slug, router]);

  const allDecided = page.blocks.every((b) => decisions[b.id] !== undefined);
  const decidedCount = page.blocks.filter((b) => decisions[b.id] !== undefined).length;

  const saveBlock = useCallback(async (blockId: string, decision: BlockDecision) => {
    if (!sessionId) return;
    setDecision(blockId, decision);
    // Persist to DB (non-blocking — UI is already updated optimistically)
    fetch(`/api/content-review/sessions/${sessionId}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, approved: decision.approved, suggestion: decision.suggestion }),
    })
      .then(() => markBlockSaved(blockId))
      .catch(() => {}); // silent fail — store is source of truth, can retry on complete
  }, [sessionId, setDecision, markBlockSaved]);

  async function handleContinue() {
    if (!sessionId || !allDecided) return;
    setSaving(true);
    setError(null);

    // Ensure all decisions on this page are synced to DB
    try {
      await Promise.all(
        page.blocks.map((block) => {
          const d = decisions[block.id];
          if (!d) return Promise.resolve();
          return fetch(`/api/content-review/sessions/${sessionId}/blocks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blockId: block.id, approved: d.approved, suggestion: d.suggestion }),
          });
        })
      );
    } catch {
      setError("Wystąpił błąd zapisu. Spróbuj ponownie.");
      setSaving(false);
      return;
    }

    if (nextPageSlug) {
      router.push(`/review/${pillar.slug}/${nextPageSlug}`);
    } else {
      router.push(`/review/${pillar.slug}/final`);
    }
  }

  const progressPercent = Math.round(((pageIndex + decidedCount / page.blocks.length) / (totalPages + 1)) * 100);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", paddingBottom: "6rem" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #DDE3EE", backgroundColor: "#FFFFFF", padding: "1rem 2rem", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A6B2CC", margin: 0 }}>
              {pillar.name} · Strona {pageIndex + 1} z {totalPages}
            </p>
            <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#242F44", margin: "0.125rem 0 0" }}>{page.title}</p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontSize: "0.75rem", color: "#A6B2CC", margin: 0 }}>{decidedCount}/{page.blocks.length} ocenionych</p>
            {/* Progress bar */}
            <div style={{ width: "120px", height: "2px", backgroundColor: "#EEF2F8", marginTop: "0.375rem", marginLeft: "auto" }}>
              <div style={{ height: "100%", width: `${progressPercent}%`, backgroundColor: "#006D9E", transition: "width 0.3s" }} />
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "2.5rem 2rem" }}>

        {/* Page reference link */}
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.75rem", color: "#006D9E", textDecoration: "none", fontWeight: 500 }}
          >
            {page.url} ↗
          </a>
          <span style={{ fontSize: "0.75rem", color: "#A6B2CC" }}>— otwórz stronę dla kontekstu</span>
        </div>

        {/* Block cards */}
        {page.blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            decision={decisions[block.id]}
            onDecide={saveBlock}
            saving={saving}
          />
        ))}

        {/* Error */}
        {error && (
          <p style={{ fontSize: "0.875rem", color: "#8E0055", marginBottom: "1rem" }}>{error}</p>
        )}

        {/* Continue button */}
        <div style={{ paddingTop: "1rem", borderTop: "1px solid #DDE3EE" }}>
          {!allDecided && (
            <p style={{ fontSize: "0.8125rem", color: "#A6B2CC", marginBottom: "0.875rem" }}>
              Oceń wszystkie bloki, aby przejść dalej ({page.blocks.length - decidedCount} pozostało).
            </p>
          )}
          <button
            onClick={handleContinue}
            disabled={!allDecided || saving}
            style={{
              padding: "0.875rem 2rem",
              backgroundColor: allDecided && !saving ? "#242F44" : "#CAD2E3",
              border: "none",
              color: "#FFFFFF",
              fontSize: "0.9375rem",
              fontWeight: 500,
              cursor: allDecided && !saving ? "pointer" : "not-allowed",
              letterSpacing: "0.01em",
            }}
          >
            {saving ? "Zapisywanie..." : nextPageSlug ? `Następna strona — ${pillar.pages[pageIndex + 1]?.title} →` : "Pytania końcowe →"}
          </button>
        </div>

      </main>
    </div>
  );
}
