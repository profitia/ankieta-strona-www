import Link from "next/link";
import { getPillars } from "@/lib/db/pillars";
import { PillarCardServer } from "./PillarCardServer";

export const metadata = {
  title: "Ocena strony - Profitia Review",
};

export default async function FilarPage() {
  const pillars = await getPillars();

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
            maxWidth: "640px",
            margin: "0 auto",
            padding: "0 2rem",
            display: "flex",
            alignItems: "center",
          }}
        >
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
        </div>
      </header>

      {/* Content */}
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "4rem 2rem 6rem",
        }}
      >
        {/* Intro */}
        <div style={{ marginBottom: "3rem" }}>
          <p className="label-procedural" style={{ marginBottom: "0.625rem" }}>
            Wybór obszaru
          </p>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 300,
              color: "#242F44",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: "0.875rem",
            }}
          >
            Który obszar chcesz ocenić?
          </h1>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "#767171",
              lineHeight: 1.75,
              maxWidth: "52ch",
            }}
          >
            Każdy obszar zawiera kilka sekcji do oceny. Możesz zaczynać od
            dowolnego i wracać do pozostałych.
          </p>
        </div>

        {/* Pillars list */}
        <div style={{ borderTop: "1px solid #DDE3EE" }}>
          {pillars.map((pillar) => (
            <PillarCardServer key={pillar.id} pillar={pillar} />
          ))}
        </div>

        {/* Note */}
        <p
          style={{
            marginTop: "3rem",
            fontSize: "0.75rem",
            color: "#CAD2E3",
            lineHeight: 1.6,
            letterSpacing: "0.02em",
          }}
        >
          Oceny zapisywane są automatycznie po każdej sekcji.
        </p>
      </div>
    </div>
  );
}
