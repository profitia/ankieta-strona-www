"use client";

interface ScoreFieldProps {
  label: string;
  description: string;
  value: number | undefined;
  onChange: (value: number) => void;
  error?: string;
}

const SCALE_LABELS: Record<number, string> = {
  1: "Bardzo słabo",
  2: "Słabo",
  3: "Przeciętnie",
  4: "Dobrze",
  5: "Bardzo dobrze",
};

export function ScoreField({ label, description, value, onChange, error }: ScoreFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      {/* Label */}
      <div>
        <p
          style={{
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "#242F44",
            lineHeight: 1.4,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "#A6A6A6",
            lineHeight: 1.5,
            marginTop: "0.1875rem",
          }}
        >
          {description}
        </p>
      </div>

      {/* Segmented scale */}
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            border: "1px solid #DDE3EE",
            overflow: "hidden",
          }}
        >
          {[1, 2, 3, 4, 5].map((score) => {
            const selected = value === score;
            return (
              <button
                key={score}
                type="button"
                onClick={() => onChange(score)}
                aria-pressed={selected}
                aria-label={`${label}: ${SCALE_LABELS[score]}`}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.75rem 0",
                  borderRight: score < 5 ? "1px solid #DDE3EE" : "none",
                  backgroundColor: selected ? "#242F44" : "transparent",
                  cursor: "pointer",
                  transition: "background-color 150ms ease",
                  outline: "none",
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: selected ? 500 : 400,
                    color: selected ? "#FFFFFF" : "#767171",
                    letterSpacing: "0.01em",
                    transition: "color 150ms ease",
                  }}
                >
                  {score}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scale endpoints */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.375rem",
          }}
        >
          <span
            style={{
              fontSize: "0.6875rem",
              color: "#A6A6A6",
              letterSpacing: "0.03em",
            }}
          >
            Bardzo słabo
          </span>
          {value && (
            <span
              style={{
                fontSize: "0.6875rem",
                color: "#006D9E",
                letterSpacing: "0.03em",
                fontWeight: 500,
              }}
            >
              {SCALE_LABELS[value]}
            </span>
          )}
          <span
            style={{
              fontSize: "0.6875rem",
              color: "#A6A6A6",
              letterSpacing: "0.03em",
            }}
          >
            Bardzo dobrze
          </span>
        </div>
      </div>

      {error && (
        <p style={{ fontSize: "0.75rem", color: "#B91C1C" }}>{error}</p>
      )}
    </div>
  );
}
