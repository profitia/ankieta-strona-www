import Link from "next/link";

export const metadata = {
  title: "Profitia Review",
};

export default function StartPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        backgroundColor: "#F8FAFC",
      }}
    >
      <div style={{ width: "100%", maxWidth: "480px" }}>
        {/* Brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "3.5rem",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              backgroundColor: "#242F44",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              P
            </span>
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#A6A6A6",
            }}
          >
            Profitia Review
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: 300,
            color: "#242F44",
            letterSpacing: "-0.035em",
            lineHeight: 1.15,
            marginBottom: "0.5rem",
          }}
        >
          Strategiczna ocena
          <br />
          strony internetowej
        </h1>

        {/* Thin rule */}
        <div
          style={{
            width: "2.5rem",
            height: "1px",
            backgroundColor: "#006D9E",
            margin: "1.75rem 0",
          }}
        />

        {/* Body */}
        <p
          style={{
            fontSize: "0.9375rem",
            color: "#767171",
            lineHeight: 1.8,
            maxWidth: "42ch",
            marginBottom: "0.875rem",
          }}
        >
          Platforma służy zebraniu systematycznej oceny eksperckiej strony
          profitia.pl - sekcja po sekcji, wymiar po wymiarze.
        </p>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "#767171",
            lineHeight: 1.8,
            maxWidth: "42ch",
            marginBottom: "3rem",
          }}
        >
          Przed przystąpieniem do oceny możesz zapoznać się z założeniami i
          strategicznym kontekstem strony.
        </p>

        {/* Links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Link
            href="/kontekst"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.875rem",
              color: "#767171",
              textDecoration: "none",
              letterSpacing: "0.01em",
              transition: "color 150ms ease",
            }}
            className="group"
          >
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#CAD2E3",
                transition: "color 150ms",
              }}
              className="group-hover:text-corp-blue"
            >
              01
            </span>
            <span className="group-hover:text-navy" style={{ transition: "color 150ms" }}>
                          Przeczytaj założenia strony (ok. 5 min)
            </span>
          </Link>

          <Link
            href="/filar"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.875rem",
              color: "#242F44",
              textDecoration: "none",
              letterSpacing: "0.01em",
              fontWeight: 500,
              transition: "color 150ms ease",
            }}
            className="group"
          >
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#006D9E",
              }}
            >
              02
            </span>
            <span>Rozpocznij ocenę →</span>
          </Link>
        </nav>

        {/* Footer note */}
        <p
          style={{
            marginTop: "4rem",
            fontSize: "0.75rem",
            color: "#CAD2E3",
            letterSpacing: "0.03em",
            lineHeight: 1.6,
          }}
        >
          Oceny są zapisywane automatycznie.
          <br />
          Możesz wracać do formularza w dowolnym momencie.
        </p>
      </div>
    </div>
  );
}
