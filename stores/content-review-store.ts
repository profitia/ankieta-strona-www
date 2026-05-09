import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface BlockDecision {
  approved: boolean;
  suggestion?: string;
}

export interface FinalAnswer {
  approved: boolean;
  comment?: string;
}

interface ContentReviewState {
  sessionId: string | null;
  pillarSlug: string | null;
  decisions: Record<string, BlockDecision>; // blockId -> decision
  finalAnswers: Record<string, FinalAnswer>; // questionId -> answer
  savedBlockIds: string[]; // confirmed saved to DB

  setSession: (sessionId: string, pillarSlug: string) => void;
  setDecision: (blockId: string, decision: BlockDecision) => void;
  setFinalAnswer: (questionId: string, answer: FinalAnswer) => void;
  markBlockSaved: (blockId: string) => void;
  clearAll: () => void;
}

export const useContentReviewStore = create<ContentReviewState>()(
  persist(
    (set) => ({
      sessionId: null,
      pillarSlug: null,
      decisions: {},
      finalAnswers: {},
      savedBlockIds: [],

      setSession: (sessionId, pillarSlug) =>
        set({ sessionId, pillarSlug }),

      setDecision: (blockId, decision) =>
        set((state) => ({
          decisions: { ...state.decisions, [blockId]: decision },
        })),

      setFinalAnswer: (questionId, answer) =>
        set((state) => ({
          finalAnswers: { ...state.finalAnswers, [questionId]: answer },
        })),

      markBlockSaved: (blockId) =>
        set((state) => ({
          savedBlockIds: state.savedBlockIds.includes(blockId)
            ? state.savedBlockIds
            : [...state.savedBlockIds, blockId],
        })),

      clearAll: () =>
        set({
          sessionId: null,
          pillarSlug: null,
          decisions: {},
          finalAnswers: {},
          savedBlockIds: [],
        }),
    }),
    {
      name: "profitia-content-review",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
