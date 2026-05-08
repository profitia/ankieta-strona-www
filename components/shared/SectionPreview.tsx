"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { getSectionPreview } from "@/lib/config/content";

interface SectionPreviewProps {
  sectionSlug: string;
  pillarName: string;
}

export function SectionPreview({ sectionSlug, pillarName }: SectionPreviewProps) {
  const config = getSectionPreview(sectionSlug);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLightbox(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen, closeLightbox]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Document header */}
      <div>
        <p
          className="label-procedural"
          style={{ marginBottom: "0.5rem" }}
        >
          {pillarName} · Brief sekcji
        </p>
        <h2
          style={{
            fontSize: "1.625rem",
            fontWeight: 300,
            color: "#242F44",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            marginBottom: "1rem",
          }}
        >
          {config.label}
        </h2>
        <div
          style={{
            width: "2rem",
            height: "1px",
            backgroundColor: "#006D9E",
            marginBottom: "1.25rem",
          }}
        />
        <p
          style={{
            fontSize: "0.875rem",
            color: "#3B3838",
            lineHeight: 1.8,
            maxWidth: "52ch",
          }}
        >
          {config.description}
        </p>
      </div>

      {/* Key elements */}
      <div>
        <p
          className="label-procedural"
          style={{ marginBottom: "1rem" }}
        >
          Elementy kluczowe
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {config.elements.map((el, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                padding: "0.75rem 0",
                borderBottom: i < config.elements.length - 1 ? "1px solid #EEF2F8" : "none",
              }}
            >
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  color: "#006D9E",
                  minWidth: "1.25rem",
                  paddingTop: "0.1rem",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "#3B3838",
                  lineHeight: 1.6,
                }}
              >
                {el}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation criteria - institutional callout */}
      <div
        style={{
          borderLeft: "3px solid #006D9E",
          paddingLeft: "1.25rem",
        }}
      >
        <p
          className="label-procedural"
          style={{ marginBottom: "0.875rem", color: "#006D9E" }}
        >
          Kryteria oceny
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {config.evaluationTips.map((tip, i) => (
            <p
              key={i}
              style={{
                fontSize: "0.8125rem",
                color: "#767171",
                lineHeight: 1.65,
                paddingLeft: "0.75rem",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "0.45em",
                  width: "0.25rem",
                  height: "0.25rem",
                  borderRadius: "50%",
                  backgroundColor: "#CAD2E3",
                  display: "inline-block",
                }}
              />
              {tip}
            </p>
          ))}
        </div>
      </div>

      {/* Section preview - screenshot or structural sketch */}
      <div>
        <p className="label-procedural" style={{ marginBottom: "1rem" }}>
          Widok sekcji
        </p>

        {config.screenshotPath ? (
          <>
            {/* Thumbnail - click to zoom */}
            <div
              onClick={() => setLightboxOpen(true)}
              role="button"
              aria-label="Powiększ widok sekcji"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setLightboxOpen(true); }}
              style={{
                cursor: "zoom-in",
                border: "1px solid #DDE3EE",
                overflow: "hidden",
                position: "relative",
                lineHeight: 0,
              }}
            >
              <Image
                src={config.screenshotPath}
                alt={`Widok sekcji: ${config.label}`}
                width={1440}
                height={900}
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                  objectPosition: "top",
                  display: "block",
                }}
                priority={false}
                unoptimized
              />
              {/* Hover hint overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0)",
                  transition: "background 0.15s",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  padding: "0.5rem",
                  pointerEvents: "none",
                }}
                className="screenshot-hover-overlay"
              />
            </div>
            <p
              className="label-procedural"
              style={{ marginTop: "0.5rem", color: "#A6A6A6" }}
            >
              Kliknij, aby powiększyć
            </p>

            {/* Lightbox */}
            {lightboxOpen && (
              <div
                onClick={closeLightbox}
                role="dialog"
                aria-modal="true"
                aria-label="Powiększony widok sekcji"
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 9999,
                  backgroundColor: "rgba(0,0,0,0.88)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "zoom-out",
                }}
              >
                {/* Close button */}
                <button
                  onClick={closeLightbox}
                  style={{
                    position: "absolute",
                    top: "1.25rem",
                    right: "1.5rem",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "#fff",
                    fontSize: "1rem",
                    lineHeight: 1,
                    padding: "0.5rem 0.875rem",
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                    fontFamily: "inherit",
                  }}
                  aria-label="Zamknij"
                >
                  ✕
                </button>
                <Image
                  src={config.screenshotPath}
                  alt={`Pełny widok sekcji: ${config.label}`}
                  width={1440}
                  height={900}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    objectFit: "contain",
                    boxShadow: "0 16px 80px rgba(0,0,0,0.6)",
                    cursor: "default",
                  }}
                  unoptimized
                />
              </div>
            )}
          </>
        ) : (
          <StructureSketch wireframeType={config.wireframeType} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Structural sketches - minimal, document-like
// ---------------------------------------------------------------------------

type WireframeType = "hero" | "features" | "offer" | "cta" | "footer" | "generic";

function StructureSketch({ wireframeType }: { wireframeType: WireframeType }) {
  const blockStyle: React.CSSProperties = {
    backgroundColor: "#F0F3F9",
    border: "1px solid #DDE3EE",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.5625rem",
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#A6A6A6",
    padding: "0.5rem 0.625rem",
    display: "flex",
    alignItems: "center",
  };

  const frame: React.CSSProperties = {
    border: "1px solid #DDE3EE",
    backgroundColor: "#FAFBFC",
    overflow: "hidden",
  };

  if (wireframeType === "hero") {
    return (
      <div style={{ ...frame, padding: "0" }}>
        {/* Nav hint */}
        <div style={{ height: "20px", borderBottom: "1px solid #EEF2F8", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", padding: "0 0.75rem", gap: "0.5rem" }}>
          <div style={{ width: "16px", height: "6px", backgroundColor: "#006D9E", opacity: 0.4 }} />
          <div style={{ flex: 1 }} />
          {[1, 2, 3].map(i => <div key={i} style={{ width: "20px", height: "4px", backgroundColor: "#CAD2E3" }} />)}
        </div>
        <div style={{ padding: "1rem" }}>
          {/* H1 */}
          <div style={{ height: "12px", backgroundColor: "#3B3838", opacity: 0.2, width: "70%", marginBottom: "0.5rem" }} />
          <div style={{ height: "8px", backgroundColor: "#3B3838", opacity: 0.12, width: "50%", marginBottom: "1rem" }} />
          {/* CTAs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <div style={{ height: "20px", width: "60px", backgroundColor: "#006D9E", opacity: 0.5 }} />
            <div style={{ height: "20px", width: "60px", border: "1px solid #DDE3EE" }} />
          </div>
          {/* Visual */}
          <div style={{ height: "50px", backgroundColor: "#EEF2F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ ...labelStyle, padding: 0 }}>VISUAL</span>
          </div>
        </div>
        <div style={{ ...blockStyle, ...labelStyle, borderTop: "none" }}>H1 · Podtytuł · CTA · Visual</div>
      </div>
    );
  }

  if (wireframeType === "features") {
    return (
      <div style={{ ...frame, padding: "1rem" }}>
        <div style={{ height: "8px", backgroundColor: "#3B3838", opacity: 0.18, width: "40%", margin: "0 auto 0.375rem" }} />
        <div style={{ height: "5px", backgroundColor: "#3B3838", opacity: 0.1, width: "55%", margin: "0 auto 1rem" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ padding: "0.625rem", ...blockStyle, display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <div style={{ width: "12px", height: "12px", backgroundColor: "#006D9E", opacity: 0.3 }} />
              <div style={{ height: "5px", backgroundColor: "#3B3838", opacity: 0.2, width: "80%" }} />
              <div style={{ height: "4px", backgroundColor: "#3B3838", opacity: 0.1, width: "100%" }} />
              <div style={{ height: "4px", backgroundColor: "#3B3838", opacity: 0.1, width: "65%" }} />
            </div>
          ))}
        </div>
        <div style={{ ...blockStyle, ...labelStyle, borderTop: "none", marginTop: "0.5rem" }}>Benefity · Ikony · Opisy</div>
      </div>
    );
  }

  if (wireframeType === "offer") {
    return (
      <div style={{ ...frame, padding: "1rem" }}>
        <div style={{ height: "8px", backgroundColor: "#3B3838", opacity: 0.2, width: "35%", marginBottom: "0.75rem" }} />
        {[1, 2].map(i => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem", ...blockStyle, marginBottom: "0.375rem" }}>
            <div style={{ flex: 1 }}>
              <div style={{ height: "5px", backgroundColor: "#3B3838", opacity: 0.2, width: "60%", marginBottom: "0.25rem" }} />
              <div style={{ height: "4px", backgroundColor: "#3B3838", opacity: 0.1, width: "85%" }} />
            </div>
            <div style={{ height: "18px", width: "44px", backgroundColor: "#006D9E", opacity: 0.4 }} />
          </div>
        ))}
        <div style={{ ...blockStyle, ...labelStyle, borderTop: "none" }}>Oferty · Zakres · CTA</div>
      </div>
    );
  }

  if (wireframeType === "cta") {
    return (
      <div style={{ ...frame, padding: "1rem" }}>
        <div style={{ border: "1px solid #CAD2E3", backgroundColor: "#EEF2F8", padding: "1.25rem", textAlign: "center" }}>
          <div style={{ height: "8px", backgroundColor: "#242F44", opacity: 0.2, width: "55%", margin: "0 auto 0.375rem" }} />
          <div style={{ height: "5px", backgroundColor: "#3B3838", opacity: 0.1, width: "40%", margin: "0 auto 1rem" }} />
          <div style={{ height: "22px", width: "80px", backgroundColor: "#006D9E", opacity: 0.5, margin: "0 auto" }} />
        </div>
        <div style={{ ...blockStyle, ...labelStyle, borderTop: "none" }}>Headline · Tekst motywacyjny · CTA</div>
      </div>
    );
  }

  if (wireframeType === "footer") {
    return (
      <div style={{ ...frame, padding: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div>
            <div style={{ height: "6px", backgroundColor: "#006D9E", opacity: 0.4, width: "30px", marginBottom: "0.5rem" }} />
            <div style={{ height: "4px", backgroundColor: "#3B3838", opacity: 0.1, width: "85%", marginBottom: "0.2rem" }} />
            <div style={{ height: "4px", backgroundColor: "#3B3838", opacity: 0.1, width: "65%" }} />
          </div>
          {[1, 2].map(col => (
            <div key={col}>
              <div style={{ height: "5px", backgroundColor: "#3B3838", opacity: 0.2, width: "50%", marginBottom: "0.375rem" }} />
              {[1, 2, 3].map(r => (
                <div key={r} style={{ height: "4px", backgroundColor: "#3B3838", opacity: 0.1, width: "70%", marginBottom: "0.2rem" }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #DDE3EE", paddingTop: "0.5rem", display: "flex", justifyContent: "space-between" }}>
          <div style={{ height: "4px", backgroundColor: "#3B3838", opacity: 0.1, width: "80px" }} />
          <div style={{ height: "4px", backgroundColor: "#3B3838", opacity: 0.1, width: "60px" }} />
        </div>
        <div style={{ ...blockStyle, ...labelStyle, borderTop: "none", marginTop: "0.5rem" }}>Logo · Linki · Dane kontaktowe · Legal</div>
      </div>
    );
  }

  // Generic
  return (
    <div style={{ ...frame, padding: "1rem" }}>
      <div style={{ height: "8px", backgroundColor: "#3B3838", opacity: 0.2, width: "45%", marginBottom: "0.75rem" }} />
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: "5px", backgroundColor: "#3B3838", opacity: 0.1, width: `${70 + i * 7}%`, marginBottom: "0.3rem" }} />
      ))}
      <div style={{ ...blockStyle, height: "36px", marginTop: "0.75rem" }} />
      <div style={{ ...blockStyle, ...labelStyle, borderTop: "none", marginTop: "0.25rem" }}>Treść sekcji</div>
    </div>
  );
}
