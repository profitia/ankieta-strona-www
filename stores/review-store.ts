"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReviewDraft = {
  clarityScore?: number;
  businessScore?: number;
  trustScore?: number;
  designScore?: number;
  ctaScore?: number;
  severity?: string;
  feedbackTypes?: string[];
  problem?: string;
  impact?: string;
  suggestion?: string;
  notes?: string;
};

type ReviewStore = {
  // Active session state
  sessionId: string | null;
  pillarSlug: string | null;
  pillarId: string | null;

  // Drafts: sectionId → partial form data (persisted locally)
  drafts: Record<string, ReviewDraft>;

  // Sections confirmed saved to DB: sectionId → true
  savedToDb: Record<string, boolean>;

  // Completed sections per pillar: pillarSlug → sectionSlug[]
  completedSections: Record<string, string[]>;

  // Actions
  setSession: (sessionId: string, pillarId: string, pillarSlug: string) => void;
  saveDraft: (sectionId: string, data: ReviewDraft) => void;
  markSavedToDb: (sectionId: string) => void;
  markSectionComplete: (pillarSlug: string, sectionSlug: string) => void;
  isSectionComplete: (pillarSlug: string, sectionSlug: string) => boolean;
  getCompletedCount: (pillarSlug: string) => number;
  getDraft: (sectionId: string) => ReviewDraft | null;
  clearSession: () => void;
  clearAll: () => void;
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      sessionId: null,
      pillarSlug: null,
      pillarId: null,
      drafts: {},
      savedToDb: {},
      completedSections: {},

      setSession: (sessionId, pillarId, pillarSlug) =>
        set({ sessionId, pillarId, pillarSlug }),

      saveDraft: (sectionId, data) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [sectionId]: { ...state.drafts[sectionId], ...data },
          },
        })),

      markSavedToDb: (sectionId) =>
        set((state) => ({
          savedToDb: { ...state.savedToDb, [sectionId]: true },
        })),

      markSectionComplete: (pillarSlug, sectionSlug) =>
        set((state) => {
          const existing = state.completedSections[pillarSlug] ?? [];
          if (existing.includes(sectionSlug)) return state;
          return {
            completedSections: {
              ...state.completedSections,
              [pillarSlug]: [...existing, sectionSlug],
            },
          };
        }),

      isSectionComplete: (pillarSlug, sectionSlug) => {
        const completed = get().completedSections[pillarSlug] ?? [];
        return completed.includes(sectionSlug);
      },

      getCompletedCount: (pillarSlug) => {
        return (get().completedSections[pillarSlug] ?? []).length;
      },

      getDraft: (sectionId) => get().drafts[sectionId] ?? null,

      clearSession: () =>
        set({ sessionId: null, pillarSlug: null, pillarId: null }),

      clearAll: () =>
        set({
          sessionId: null,
          pillarSlug: null,
          pillarId: null,
          drafts: {},
          savedToDb: {},
          completedSections: {},
        }),
    }),
    {
      name: "profitia-review",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : (undefined as never)
      ),
    }
  )
);
