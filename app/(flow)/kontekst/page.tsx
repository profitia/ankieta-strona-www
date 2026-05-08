import Link from "next/link";
import { ARCHITECTURE_CONTEXT } from "@/lib/config/content";

export const metadata = {
  title: "Założenia strony - Profitia Review",
};

export default function KontekstPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      {/* Procedural header */}
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
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <nav style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <Link
              href="/start"
              style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#A6A6A6",
                textDecoration: "none",
                transition: "color 150ms",
              }}
              className="hover:text-navy"
            >
                          ← Powót do startu
            </Link>
            <span style={{ margin: "0 0.875rem", color: "#D9D9D9", fontSize: "0.75rem" }}>·</span>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#242F44",
              }}
            >
              Założenia strony
            </span>
          </nav>

          <Link
            href="/filar"
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: "#006D9E",
              textDecoration: "none",
              transition: "color 150ms",
            }}
          >
                          Wybór obszarów →
          </Link>
        </div>
      </header>

      {/* Content */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "0 2rem",
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "4rem",
          paddingTop: "4rem",
          paddingBottom: "6rem",
        }}
        className="max-lg:block"
      >
        {/* Sticky TOC */}
        <aside
          style={{
            position: "sticky",
            top: "72px",
            height: "fit-content",
            paddingTop: "0.25rem",
          }}
          className="max-lg:hidden"
        >
          <p className="label-procedural" style={{ marginBottom: "1.25rem" }}>
            Spis treści
          </p>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {ARCHITECTURE_CONTEXT.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  color: "#767171",
                  textDecoration: "none",
                  padding: "0.375rem 0",
                  borderBottom: "1px solid #F0F3F9",
                  transition: "color 150ms",
                  lineHeight: 1.5,
                }}
                className="hover:text-navy"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Article */}
        <article>
          {/* Intro */}
          <div style={{ marginBottom: "3.5rem", paddingBottom: "3rem", borderBottom: "1px solid #DDE3EE" }}>
            <p className="label-procedural" style={{ marginBottom: "0.75rem" }}>
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
              Lektura poniższego kontekstu zajmie ok. 5 minut. Materiał ten
              jest niezbędny do rzetelnej oceny każdej sekcji - zarówno pod
              kątem komunikacji, jak i celów biznesowych.
            </p>
          </div>

          {/* Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
            {ARCHITECTURE_CONTEXT.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                style={{ scrollMarginTop: "72px" }}
              >
                {/* Section label */}
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
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 400,
                      color: "#242F44",
                      letterSpacing: "-0.025em",
                      lineHeight: 1.3,
                    }}
                  >
                    {section.title}
                  </h2>
                </div>

                {/* Body paragraphs */}
                <div
                  style={{
                    paddingLeft: "2.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {section.body.map((paragraph, i) => (
                    <p
                      key={i}
                      style={{
                        fontSize: "0.9375rem",
                        color: i === 0 ? "#3B3838" : "#767171",
                        lineHeight: 1.8,
                        maxWidth: "68ch",
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
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <p
              style={{
                fontSize: "0.9375rem",
                color: "#767171",
                lineHeight: 1.7,
              }}
            >
              Kontekst zapoznany. Możesz teraz przystąpić do oceny.
            </p>
            <Link
              href="/filar"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#242F44",
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
                            Wybór obszarów →
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
