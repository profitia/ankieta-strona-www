import { z } from "zod";

// ---------------------------------------------------------------------------
// Pillar
// ---------------------------------------------------------------------------

export const pillarSchema = z.object({
  slug: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(128),
});

export type PillarInput = z.infer<typeof pillarSchema>;

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export const sectionSchema = z.object({
  pillarId: z.string().cuid(),
  slug: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(128),
  order: z.number().int().min(0).default(0),
});

export type SectionInput = z.infer<typeof sectionSchema>;

// ---------------------------------------------------------------------------
// ReviewSession
// ---------------------------------------------------------------------------

export const reviewSessionSchema = z.object({
  pillarId: z.string().cuid(),
});

export type ReviewSessionInput = z.infer<typeof reviewSessionSchema>;

// ---------------------------------------------------------------------------
// SectionReview
// ---------------------------------------------------------------------------

const scoreField = z.number().int().min(1).max(5);

export const sectionReviewSchema = z.object({
  sessionId: z.string().cuid(),
  sectionId: z.string().cuid(),
  clarityScore: scoreField,
  businessScore: scoreField,
  trustScore: scoreField,
  designScore: scoreField,
  ctaScore: scoreField,
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  feedbackTypes: z.array(z.string()),
  problem: z.string().min(1).max(2000),
  impact: z.string().min(1).max(2000),
  suggestion: z.string().min(1).max(2000),
  notes: z.string().max(1000).optional(),
  screenshotUrl: z.string().url().optional(),
});

export type SectionReviewInput = z.infer<typeof sectionReviewSchema>;
