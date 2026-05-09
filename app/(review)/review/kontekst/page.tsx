import Link from "next/link";
import { ARCHITECTURE_CONTEXT } from "@/lib/config/content";

export const metadata = {
  title: "Kontekst strategiczny — Profitia Content Review",
};

export default function ReviewKontekstPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
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
            maxWidth: "800px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/review"
            style={{
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#A6A6A6",
              textDecoration: "none",
            }}
          >
            ← Powrót do wyboru obszaru
          </Link>
          <Link
            href="/review"
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: "#006D9E",
              textDecoration: "none",
            }}
          >
            Przejdź do review →
          </Link>
        </div>
      </header>

      {/* Content */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "4rem 2rem 6rem",
        }}
      >
        {/* Intro */}
        <div style={{ marginBottom: "3.5rem", paddingBottom: "3rem", borderBottom: "1px solid #DDE3EE" }}>
          <p
            style={{
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#A6B2CC",
              marginBottom: "0.75rem",
            }}
          >
            Kontekst strategiczny
          </p>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 300,
              color: "#242F44",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: "1.25rem",
            }}
          >
            Założenia strony profitia.pl
          </h1>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "#767171",
              lineHeight: 1.8,
              maxWidth: "60ch",
            }}
          >
            Lektura tego kontekstu zajmie ok. 5 minut. Pomoże Ci oceniać treści
            nie jako tekst, lecz jako elementy strategicznej komunikacji
            skierowanej do konkretnych odbiorców w konkretnych celach.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          {ARCHITECTURE_CONTEXT.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              style={{ scrollMarginTop: "72px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    color: "#006D9E",
                    fontVariantNumeric: "tabular-nums",
                    flexShrink: 0,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 400,
                    color: "#242F44",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.3,
                  }}
                >
                  {section.title}
                </h2>
              </div>

              <div
                style={{
                  paddingLeft: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                }}
              >
                {section.body.map((paragraph, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: "0.9375rem",
                      color: i === 0 ? "#3B3838" : "#767171",
                      lineHeight: 1.8,
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: "4rem",
            paddingTop: "3rem",
            borderTop: "1px solid #DDE3EE",
          }}
        >
          <p
            style={{
              fontSize: "0.9375rem",
              color: "#767171",
              lineHeight: 1.7,
              marginBottom: "1.5rem",
            }}
          >
            Kontekst zapoznany. Możesz teraz wybrać obszar do przeglądu.
          </p>
          <Link
            href="/review"
            style={{
              display: "inline-block",
              padding: "0.875rem 2rem",
              backgroundColor: "#242F44",
              color: "#FFFFFF",
              fontSize: "0.9375rem",
              fontWeight: 500,
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            Wybierz obszar do review →
          </Link>
        </div>
      </div>
    </div>
  );
}
