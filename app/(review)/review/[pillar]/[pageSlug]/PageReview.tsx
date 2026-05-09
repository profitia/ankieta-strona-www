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

// ─── Save state per block ─────────────────────────────────────────────────
type SaveState = "idle" | "saving" | "saved" | "editing";

function BlockCard({
  block,
  decision,
  onDecide,
  globalSaving,
}: {
  block: ContentBlock;
  decision: BlockDecision | undefined;
  onDecide: (blockId: string, decision: BlockDecision) => void;
  globalSaving: boolean;
}) {
  const [saveState, setSaveState] = useState<SaveState>(
    decision?.approved === false && (decision.suggestion || decision.approved === false) ? "saved" : "idle"
  );
  const [draft, setDraft] = useState(decision?.suggestion ?? "");

  const isApproved = decision?.approved === true;
  const isRejected = decision?.approved === false;
  const showTextarea = isRejected && saveState !== "saved";

  function handleApprove() {
    setSaveState("idle");
    setDraft("");
    onDecide(block.id, { approved: true, suggestion: undefined });
  }

  function handleReject() {
    if (isRejected && saveState === "saved") {
      // Already rejected & saved — clicking again just re-opens editor
      setSaveState("editing");
      return;
    }
    setSaveState("idle");
    onDecide(block.id, { approved: false, suggestion: undefined });
  }

  function handleSave() {
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
      onDecide(block.id, { approved: false, suggestion: draft || undefined });
    }, 350);
  }

  function handleEdit() {
    setSaveState("editing");
  }

  const borderColor = isApproved
    ? "#BBE5C7"
    : isRejected
    ? saveState === "saved"
      ? "#E4C4D4"
      : "#F2C4D8"
    : "#DDE3EE";
  const bgColor = isApproved ? "#F6FEF9" : isRejected ? "#FDF4F8" : "#FFFFFF";

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        backgroundColor: bgColor,
        marginBottom: "1.25rem",
        transition: "border-color 0.2s, background-color 0.2s",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "0.75rem 1.25rem",
          borderBottom: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
        }}
      >
        <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC" }}>
          {block.section}
        </span>
        <span style={{ fontSize: "0.625rem", color: "#DDE3EE" }}>·</span>
        <span style={{ fontSize: "0.75rem", color: "#767171", fontWeight: 500 }}>{block.label}</span>
        {saveState === "saved" && isRejected && (
          <span style={{ marginLeft: "auto", fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#7A5C00", backgroundColor: "#FFFBEB", padding: "0.1875rem 0.5rem", border: "1px solid #F0D98C" }}>
            propozycja zapisana
          </span>
        )}
        {isApproved && (
          <span style={{ marginLeft: "auto", fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#186B47", backgroundColor: "#F0FDF4", padding: "0.1875rem 0.5rem", border: "1px solid #BBE5C7" }}>
            zatwierdzone
          </span>
        )}
      </div>

      {/* Current text */}
      <div style={{ padding: "1.25rem 1.25rem", borderBottom: `1px solid ${borderColor}` }}>
        <p style={{ fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC", marginBottom: "0.5rem" }}>
          Aktualny tekst na stronie
        </p>
        <p style={{ fontSize: "1rem", color: "#242F44", lineHeight: 1.7, margin: 0 }}>{block.currentText}</p>
        {block.context && (
          <p style={{ fontSize: "0.75rem", color: "#A6B2CC", marginTop: "0.5rem", fontStyle: "italic" }}>{block.context}</p>
        )}
      </div>

      {/* Decision */}
      <div style={{ padding: "1rem 1.25rem" }}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#3B3838", marginBottom: "0.75rem" }}>
          Czy ten tekst może pozostać?
        </p>
        <div style={{ display: "flex", gap: "0.625rem" }}>
          <button
            onClick={handleApprove}
            disabled={globalSaving}
            style={{
              flex: 1, padding: "0.625rem",
              border: `1.5px solid ${isApproved ? "#186B47" : "#DDE3EE"}`,
              backgroundColor: isApproved ? "#186B47" : "#FFFFFF",
              color: isApproved ? "#FFFFFF" : "#767171",
              fontSize: "0.8125rem", fontWeight: isApproved ? 600 : 400,
              cursor: globalSaving ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
              transition: "all 0.15s",
            }}
          >
            ✓ Tak, może zostać
          </button>
          <button
            onClick={handleReject}
            disabled={globalSaving || saveState === "saving"}
            style={{
              flex: 1, padding: "0.625rem",
              border: `1.5px solid ${isRejected ? "#8E0055" : "#DDE3EE"}`,
              backgroundColor: isRejected ? (saveState === "saved" ? "#FAF0F5" : "#8E0055") : "#FFFFFF",
              color: isRejected ? (saveState === "saved" ? "#8E0055" : "#FFFFFF") : "#767171",
              fontSize: "0.8125rem", fontWeight: isRejected ? 600 : 400,
              cursor: globalSaving ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
              transition: "all 0.15s",
            }}
          >
            ✕ Wymaga zmiany
          </button>
        </div>

        {/* Textarea — active edit mode */}
        {showTextarea && (
          <div style={{ marginTop: "0.875rem" }}>
            <p style={{ fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8E0055", marginBottom: "0.5rem" }}>
              Proponowana wersja lub komentarz
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Wpisz nową wersję tekstu lub opisz co powinno się zmienić..."
              rows={3}
              autoFocus={saveState === "editing"}
              style={{
                width: "100%", padding: "0.75rem 1rem",
                border: "1px solid #F2C4D8", borderBottom: "2px solid #8E0055",
                backgroundColor: "#FDFBFC", fontSize: "0.9375rem", color: "#242F44",
                lineHeight: 1.65, resize: "vertical", outline: "none",
                boxSizing: "border-box", fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
              <button
                onClick={handleSave}
                disabled={saveState === "saving"}
                style={{
                  padding: "0.5rem 1.25rem",
                  backgroundColor: saveState === "saving" ? "#CAD2E3" : "#242F44",
                  border: "none", color: "#FFFFFF", fontSize: "0.8125rem", fontWeight: 500,
                  cursor: saveState === "saving" ? "wait" : "pointer", letterSpacing: "0.02em",
                }}
              >
                {saveState === "saving" ? "Zapisywanie..." : "Zapisz propozycję"}
              </button>
            </div>
          </div>
        )}

        {/* Saved — locked display + Edit button */}
        {isRejected && saveState === "saved" && (
          <div style={{ marginTop: "0.875rem", padding: "0.875rem 1rem", backgroundColor: "#FDFBFC", border: "1px solid #E4C4D4", borderLeft: "3px solid #8E0055" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8E0055", marginBottom: "0.375rem" }}>
                  Propozycja zmiany
                </p>
                <p style={{ fontSize: "0.9375rem", color: "#3B3838", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>
                  {draft || <span style={{ color: "#A6B2CC", fontStyle: "italic" }}>Brak komentarza</span>}
                </p>
              </div>
              <button
                onClick={handleEdit}
                style={{
                  padding: "0.375rem 0.875rem", border: "1px solid #DDE3EE",
                  backgroundColor: "#FFFFFF", color: "#767171", fontSize: "0.75rem",
                  fontWeight: 500, cursor: "pointer", flexShrink: 0, letterSpacing: "0.02em",
                }}
              >
                Edytuj
              </button>
            </div>
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

  useEffect(() => {
    if (!sessionId) {
      router.replace(`/review/${pillar.slug}`);
    }
  }, [sessionId, pillar.slug, router]);

  const allDecided = page.blocks.every((b) => decisions[b.id] !== undefined);
  const decidedCount = page.blocks.filter((b) => decisions[b.id] !== undefined).length;

  const saveBlock = useCallback(
    async (blockId: string, decision: BlockDecision) => {
      if (!sessionId) return;
      setDecision(blockId, decision);
      fetch(`/api/content-review/sessions/${sessionId}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, approved: decision.approved, suggestion: decision.suggestion ?? null }),
      })
        .then(() => markBlockSaved(blockId))
        .catch(() => {});
    },
    [sessionId, setDecision, markBlockSaved]
  );

  async function handleContinue() {
    if (!sessionId || !allDecided) return;
    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        page.blocks.map((block) => {
          const d = decisions[block.id];
          if (!d) return Promise.resolve();
          return fetch(`/api/content-review/sessions/${sessionId}/blocks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blockId: block.id, approved: d.approved, suggestion: d.suggestion ?? null }),
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

  const progressPercent = Math.round(
    ((pageIndex + decidedCount / Math.max(page.blocks.length, 1)) / (totalPages + 1)) * 100
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", paddingBottom: "6rem" }}>
      <header style={{ borderBottom: "1px solid #DDE3EE", backgroundColor: "#FFFFFF", padding: "0.875rem 2rem", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A6B2CC", margin: 0 }}>
              {pillar.name} · Strona {pageIndex + 1} z {totalPages}
            </p>
            <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "#242F44", margin: "0.125rem 0 0", letterSpacing: "-0.01em" }}>{page.title}</p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontSize: "0.75rem", color: "#A6B2CC", margin: 0 }}>{decidedCount}/{page.blocks.length}</p>
            <div style={{ width: "100px", height: "2px", backgroundColor: "#EEF2F8", marginTop: "0.375rem", marginLeft: "auto" }}>
              <div style={{ height: "100%", width: `${progressPercent}%`, backgroundColor: "#006D9E", transition: "width 0.3s" }} />
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ marginBottom: "2rem", padding: "0.625rem 0.875rem", backgroundColor: "#FFFFFF", border: "1px solid #DDE3EE", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.07em", textTransform: "uppercase", color: "#A6B2CC" }}>Oceniasz</span>
          <a href={page.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8125rem", color: "#006D9E", textDecoration: "none", fontWeight: 500 }}>
            {page.url} ↗
          </a>
        </div>

        {page.blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            decision={decisions[block.id]}
            onDecide={saveBlock}
            globalSaving={saving}
          />
        ))}

        {error && <p style={{ fontSize: "0.875rem", color: "#8E0055", marginBottom: "1rem" }}>{error}</p>}

        <div style={{ paddingTop: "1.5rem", borderTop: "1px solid #DDE3EE", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          {!allDecided ? (
            <p style={{ fontSize: "0.8125rem", color: "#A6B2CC", margin: 0 }}>
              Oceń wszystkie bloki ({page.blocks.length - decidedCount} pozostało).
            </p>
          ) : (
            <span />
          )}
          <button
            onClick={handleContinue}
            disabled={!allDecided || saving}
            style={{
              padding: "0.875rem 1.75rem",
              backgroundColor: allDecided && !saving ? "#242F44" : "#CAD2E3",
              border: "none", color: "#FFFFFF", fontSize: "0.9375rem", fontWeight: 500,
              cursor: allDecided && !saving ? "pointer" : "not-allowed", letterSpacing: "0.01em", flexShrink: 0,
            }}
          >
            {saving ? "Zapisywanie..." : nextPageSlug ? `Dalej: ${pillar.pages[pageIndex + 1]?.title} →` : "Pytania końcowe →"}
          </button>
        </div>
      </main>
    </div>
  );
}

