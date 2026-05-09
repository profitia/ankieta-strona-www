import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json";

  const session = await prisma.reviewSession.findUnique({
    where: { id },
    include: {
      pillar: true,
      reviews: {
        include: { section: true },
        orderBy: { section: { order: "asc" } },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (format === "csv") {
    const headers = [
      "sessionId",
      "pillar",
      "section",
      "clarityScore",
      "businessScore",
      "trustScore",
      "designScore",
      "ctaScore",
      "avgScore",
      "severity",
      "feedbackTypes",
      "problem",
      "impact",
      "suggestion",
      "notes",
      "completedAt",
    ];

    const rows = session.reviews.map((r) => {
      const avg = ((r.clarityScore + r.businessScore + r.trustScore + r.designScore + r.ctaScore) / 5).toFixed(2);
      const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
      return [
        esc(session.id),
        esc(session.pillar.name),
        esc(r.section.name),
        r.clarityScore,
        r.businessScore,
        r.trustScore,
        r.designScore,
        r.ctaScore,
        avg,
        r.severity,
        esc(r.feedbackTypes.join("; ")),
        esc(r.problem),
        esc(r.impact),
        esc(r.suggestion),
        esc(r.notes ?? ""),
        session.completedAt?.toISOString() ?? "",
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const filename = `review-${session.pillar.slug}-${session.id.slice(0, 8)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // Default: JSON
  const payload = {
    sessionId: session.id,
    pillar: session.pillar.name,
    status: session.status,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    reviews: session.reviews.map((r) => ({
      section: r.section.name,
      sectionSlug: r.section.slug,
      scores: {
        clarity: r.clarityScore,
        business: r.businessScore,
        trust: r.trustScore,
        design: r.designScore,
        cta: r.ctaScore,
        average: parseFloat(((r.clarityScore + r.businessScore + r.trustScore + r.designScore + r.ctaScore) / 5).toFixed(2)),
      },
      severity: r.severity,
      feedbackTypes: r.feedbackTypes,
      problem: r.problem,
      impact: r.impact,
      suggestion: r.suggestion,
      notes: r.notes ?? null,
    })),
  };

  const filename = `review-${session.pillar.slug}-${session.id.slice(0, 8)}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
