"use client";

import Link from "next/link";

interface ReviewHeaderProps {
  pillarName?: string;
  pillarSlug?: string;
  currentSection?: number;
  totalSections?: number;
  isSaving?: boolean;
}

export function ReviewHeader({
  pillarName,
  pillarSlug,
  currentSection,
  totalSections,
  isSaving = false,
}: ReviewHeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
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
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left: back + breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {/* Back link */}
          {pillarSlug ? (
            <Link
              href={`/filar/${pillarSlug}`}
              style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#A6A6A6",
                textDecoration: "none",
                transition: "color 150ms",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
              className="hover:text-navy"
            >
              ← Wróć
            </Link>
          ) : (
            <Link
              href="/filar"
              style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#A6A6A6",
                textDecoration: "none",
                transition: "color 150ms",
              }}
              className="hover:text-navy"
            >
              ← Wróć
            </Link>
          )}

          {/* Breadcrumb separator */}
          <span style={{ margin: "0 0.875rem", color: "#D9D9D9", fontSize: "0.75rem", lineHeight: 1 }}>·</span>

          {/* Process name */}
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#A6A6A6",
            }}
          >
            Profitia Review
          </span>

          {pillarName && (
            <>
              <span style={{ margin: "0 0.875rem", color: "#D9D9D9", fontSize: "0.75rem", lineHeight: 1 }}>·</span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#242F44",
                }}
              >
                {pillarName}
              </span>
            </>
          )}

          {currentSection !== undefined && totalSections !== undefined && (
            <>
              <span style={{ margin: "0 0.875rem", color: "#D9D9D9", fontSize: "0.75rem", lineHeight: 1 }}>·</span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 400,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#A6A6A6",
                }}
              >
                Sekcja {currentSection} z {totalSections}
              </span>
            </>
          )}
        </nav>

        {/* Right: autosave + progress */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexShrink: 0 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.6875rem",
              fontWeight: 400,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#A6A6A6",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                backgroundColor: isSaving ? "#CAD2E3" : "#006D9E",
                transition: "background-color 400ms ease",
                flexShrink: 0,
              }}
            />
            {isSaving ? "Zapisywanie" : "Zapis automatyczny"}
          </span>

          {currentSection !== undefined && totalSections !== undefined && (
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              {Array.from({ length: totalSections }, (_, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    width: "20px",
                    height: "2px",
                    borderRadius: "1px",
                    backgroundColor: i < currentSection ? "#006D9E" : "#DDE3EE",
                    transition: "background-color 300ms ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
