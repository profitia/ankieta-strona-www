import type { Pillar, Section, ReviewSession, SectionReview } from "@/app/generated/prisma/client";

// ---------------------------------------------------------------------------
// Re-export Prisma types
// ---------------------------------------------------------------------------
export type { Pillar, Section, ReviewSession, SectionReview };

// ---------------------------------------------------------------------------
// Severity & Status
// ---------------------------------------------------------------------------
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ReviewStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

// ---------------------------------------------------------------------------
// Extended types
// ---------------------------------------------------------------------------

export type PillarWithSections = Pillar & {
  sections: Section[];
};

export type ReviewSessionWithReviews = ReviewSession & {
  reviews: SectionReview[];
  pillar: Pillar;
};

export type SectionReviewWithSection = SectionReview & {
  section: Section;
};

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

export type ApiResponse<T> = {
  data: T;
  error?: never;
} | {
  data?: never;
  error: string;
};

// ---------------------------------------------------------------------------
// Nav
// ---------------------------------------------------------------------------
export type NavItem = {
  label: string;
  href: string;
  icon: string;
};
