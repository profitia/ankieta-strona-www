import Link from "next/link";

export const metadata = {
  title: "Dziękujemy - Profitia Review",
};

export default function DziekujemyPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Brand */}
        <div
          style={{
            width: "28px",
            height: "28px",
            backgroundColor: "#242F44",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "3rem",
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

        {/* Message */}
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 300,
            color: "#242F44",
            letterSpacing: "-0.025em",
            lineHeight: 1.3,
            marginBottom: "0.875rem",
          }}
        >
          Feedback został zapisany.
        </h1>
        <div
          style={{
            width: "2rem",
            height: "1px",
            backgroundColor: "#006D9E",
            marginBottom: "1.5rem",
          }}
        />
        <p
          style={{
            fontSize: "0.9375rem",
            color: "#767171",
            lineHeight: 1.8,
            marginBottom: "3rem",
          }}
        >
          Dziękujemy za rzetelną ocenę. Zebrane informacje zostaną
          wykorzystane do przeglądu i dalszych prac nad stroną profitia.pl.
        </p>

        {/* Actions */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <Link
            href="/filar"
            style={{
              fontSize: "0.875rem",
              color: "#242F44",
              textDecoration: "none",
              fontWeight: 500,
              letterSpacing: "0.01em",
              transition: "color 150ms",
            }}
            className="hover:text-corp-blue"
          >
            Wróć do listy filarów →
          </Link>
          <Link
            href="/podsumowanie"
            style={{
              fontSize: "0.875rem",
              color: "#A6A6A6",
              textDecoration: "none",
              letterSpacing: "0.01em",
              transition: "color 150ms",
            }}
            className="hover:text-navy"
          >
            Zobacz podsumowanie ocen
          </Link>
        </nav>
      </div>
    </div>
  );
}
