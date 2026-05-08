"use client";

import { FEEDBACK_TYPES } from "@/lib/config/content";

interface FeedbackTypeSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function FeedbackTypeSelector({ value, onChange, error }: FeedbackTypeSelectorProps) {
  const toggle = (type: string) => {
    onChange(value.includes(type) ? value.filter((v) => v !== type) : [...value, type]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      <div>
        <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#242F44", lineHeight: 1.4 }}>
          Czego dotyczy uwaga?
        </p>
        <p style={{ fontSize: "0.75rem", color: "#A6A6A6", lineHeight: 1.5, marginTop: "0.1875rem" }}>
          Wybierz jeden lub więcej obszarów.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
        {FEEDBACK_TYPES.map((type) => {
          const selected = value.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggle(type)}
              aria-pressed={selected}
              style={{
                fontSize: "0.75rem",
                fontWeight: 400,
                letterSpacing: "0.01em",
                padding: "0.3125rem 0.75rem",
                border: `1px solid ${selected ? "#242F44" : "#DDE3EE"}`,
                backgroundColor: selected ? "#242F44" : "transparent",
                color: selected ? "#FFFFFF" : "#767171",
                cursor: "pointer",
                transition: "all 150ms ease",
                outline: "none",
                lineHeight: 1.4,
              }}
            >
              {type}
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
