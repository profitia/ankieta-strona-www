"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ThankYouContent() {
  const params = useSearchParams();
  const sessionId = params.get("session");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: "520px", width: "100%", textAlign: "center" }}>
        {/* Check mark */}
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#F0FDF4", border: "1.5px solid #BBE5C7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem", fontSize: "1.75rem" }}>
          ✓
        </div>

        <h1 style={{ fontSize: "2rem", fontWeight: 300, color: "#242F44", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "1rem" }}>
          Dziękujemy za review
        </h1>
        <p style={{ fontSize: "1rem", color: "#767171", lineHeight: 1.7, marginBottom: "3rem" }}>
          Twoja ocena została zapisana. Teraz możemy przejrzeć sugestie i przygotować kolejne kroki.
        </p>

        {sessionId && (
          <p style={{ fontSize: "0.6875rem", color: "#CAD2E3", fontFamily: "monospace", marginBottom: "2rem" }}>
            ID sesji: {sessionId}
          </p>
        )}

        <div style={{ padding: "1.5rem", backgroundColor: "#FFFFFF", border: "1px solid #DDE3EE", textAlign: "left" }}>
          <p style={{ fontSize: "0.875rem", color: "#767171", lineHeight: 1.7, margin: 0 }}>
            Możesz teraz zamknąć tę kartę lub wrócić do strony głównej. Jeśli masz dodatkowe uwagi, napisz bezpośrednio do Tomasza.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DziekujemyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }} />}>
      <ThankYouContent />
    </Suspense>
  );
}
