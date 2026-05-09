"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReviewStore } from "@/stores/review-store";

type AutosaveData = Record<string, unknown>;

export function useAutosave(sectionId: string, sessionId: string | null) {
  const saveDraft = useReviewStore((s) => s.saveDraft);
  const markSavedToDb = useReviewStore((s) => s.markSavedToDb);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const save = useCallback(
    (data: AutosaveData) => {
      // 1. Always persist to localStorage immediately
      saveDraft(sectionId, data);

      // 2. Debounce DB save
      if (!sessionId) return;
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        if (!mountedRef.current) return;

        // Skip if required fields are not yet filled (avoid partial DB writes)
        const hasRequiredScores =
          data.clarityScore &&
          data.businessScore &&
          data.trustScore &&
          data.designScore &&
          data.ctaScore;

        const hasRequiredText =
          typeof data.problem === "string" && data.problem.length >= 10 &&
          typeof data.impact === "string" && data.impact.length >= 10 &&
          typeof data.suggestion === "string" && data.suggestion.length >= 10;

        if (!hasRequiredScores || !hasRequiredText) return;

        try {
          const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, sectionId, ...data }),
          });

          if (res.ok && mountedRef.current) {
            markSavedToDb(sectionId);
          }
        } catch {
          // Silent fail - data is safe in localStorage
        }
      }, 1500);
    },
    [sectionId, sessionId, saveDraft, markSavedToDb]
  );

  return { save };
}
