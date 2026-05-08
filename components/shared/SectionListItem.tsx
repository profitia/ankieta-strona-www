"use client";

import Link from "next/link";

interface Section {
  id: string;
  slug: string;
  name: string;
  order: number;
}

interface SectionListItemProps {
  section: Section;
  pillarSlug: string;
  isComplete: boolean;
  index: number;
}

export function SectionListItem({ section, pillarSlug, isComplete, index }: SectionListItemProps) {
  return (
    <Link
      href={`/filar/${pillarSlug}/${section.slug}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.25rem",
        padding: "1rem 0",
        textDecoration: "none",
        borderBottom: "1px solid #EEF2F8",
        transition: "all 150ms ease",
      }}
      className="group"
    >
      {/* Index */}
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 500,
          letterSpacing: "0.04em",
          color: "#CAD2E3",
          minWidth: "1.75rem",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Name */}
      <span
        style={{
          flex: 1,
          fontSize: "0.875rem",
          color: isComplete ? "#242F44" : "#767171",
          letterSpacing: "-0.005em",
          transition: "color 150ms",
        }}
        className="group-hover:text-navy"
      >
        {section.name}
      </span>

      {/* Status */}
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: isComplete ? "#006D9E" : "#CAD2E3",
          flexShrink: 0,
        }}
      >
        {isComplete ? "Oceniona" : ""}
      </span>

      {/* Indicator dot */}
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: isComplete ? "#006D9E" : "#DDE3EE",
          flexShrink: 0,
          transition: "background-color 150ms",
        }}
      />

      {/* Arrow */}
      <span
        style={{
          fontSize: "0.875rem",
          color: "#DDE3EE",
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
