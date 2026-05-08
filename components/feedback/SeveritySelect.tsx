"use client";

import { SEVERITY_OPTIONS, type SeverityValue } from "@/lib/config/content";

interface SeveritySelectProps {
  value: SeverityValue | undefined;
  onChange: (value: SeverityValue) => void;
  error?: string;
}

export function SeveritySelect({ value, onChange, error }: SeveritySelectProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      <div>
        <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#242F44", lineHeight: 1.4 }}>
          Jak ważny jest ten problem?
        </p>
        <p style={{ fontSize: "0.75rem", color: "#A6A6A6", lineHeight: 1.5, marginTop: "0.1875rem" }}>
          Wybierz poziom, który najlepiej oddaje wagę tej uwagi.
        </p>
      </div>

      <div
        style={{
          border: "1px solid #DDE3EE",
          overflow: "hidden",
        }}
      >
        {SEVERITY_OPTIONS.map((opt, index) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value as SeverityValue)}
              aria-pressed={selected}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.75rem 1rem",
                textAlign: "left",
                borderTop: index > 0 ? "1px solid #DDE3EE" : "none",
                borderLeft: selected ? `3px solid #006D9E` : "3px solid transparent",
                backgroundColor: selected ? "#F0F3F9" : "transparent",
                cursor: "pointer",
                transition: "all 150ms ease",
                outline: "none",
              }}
            >
              {/* Dot indicator */}
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  backgroundColor: selected ? "#006D9E" : "#CAD2E3",
                  transition: "background-color 150ms ease",
                }}
              />

              {/* Labels */}
              <span style={{ flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: selected ? 500 : 400,
                    color: selected ? "#242F44" : "#3B3838",
                    transition: "font-weight 150ms",
                  }}
                >
                  {opt.label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "#A6A6A6",
                    marginTop: "0.125rem",
                    lineHeight: 1.4,
                  }}
                >
                  {opt.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p style={{ fontSize: "0.75rem", color: "#B91C1C" }}>{error}</p>
      )}
    </div>
  );
}
