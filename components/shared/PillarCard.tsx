"use client";

import Link from "next/link";

interface Pillar {
  id: string;
  slug: string;
  name: string;
  sections: { id: string }[];
}

interface PillarCardProps {
  pillar: Pillar;
  completedCount: number;
}

export function PillarCard({ pillar, completedCount }: PillarCardProps) {
  const total = pillar.sections.length;
  const isComplete = completedCount >= total && total > 0;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <Link
      href={`/filar/${pillar.slug}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        padding: "1.25rem 0",
        textDecoration: "none",
        borderBottom: "1px solid #DDE3EE",
        transition: "all 150ms ease",
      }}
      className="group"
    >
      {/* Index indicator */}
      <div
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: isComplete ? "#006D9E" : "#CAD2E3",
          flexShrink: 0,
          transition: "background-color 150ms",
        }}
      />

      {/* Name + meta */}
      <div style={{ flex: 1 }}>
        <span
          style={{
            display: "block",
            fontSize: "0.9375rem",
            fontWeight: 400,
            color: "#242F44",
            letterSpacing: "-0.01em",
            lineHeight: 1.4,
            transition: "color 150ms",
          }}
          className="group-hover:text-corp-blue"
        >
          {pillar.name}
        </span>

        {/* Progress */}
        {completedCount > 0 && (
          <span
            style={{
              display: "block",
              fontSize: "0.75rem",
              color: isComplete ? "#006D9E" : "#A6A6A6",
              marginTop: "0.25rem",
              letterSpacing: "0.02em",
            }}
          >
            {isComplete ? "Ukończone" : `${completedCount} z ${total} sekcji ocenionych`}
          </span>
        )}
      </div>

      {/* Section count */}
      <span
        style={{
          fontSize: "0.75rem",
          color: "#A6A6A6",
          letterSpacing: "0.02em",
          flexShrink: 0,
        }}
      >
        {total} sekcji
      </span>

      {/* Progress bar */}
      {completedCount > 0 && (
        <div
          style={{
            width: "48px",
            height: "2px",
            backgroundColor: "#EEF2F8",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${percent}%`,
              backgroundColor: "#006D9E",
              transition: "width 300ms ease",
            }}
          />
        </div>
      )}

      {/* Arrow */}
      <span
        style={{
          fontSize: "0.875rem",
          color: "#CAD2E3",
          flexShrink: 0,
          transition: "color 150ms, transform 150ms",
        }}
        className="group-hover:text-corp-blue"
      >
        →
      </span>
    </Link>
  );
}
