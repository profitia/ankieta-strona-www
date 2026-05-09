import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pillar = searchParams.get("pillar");

  const where = {
    status: "COMPLETED" as const,
    ...(pillar ? { pillarSlug: pillar } : {}),
  };

  const sessions = await prisma.contentSession.findMany({
    where,
    orderBy: { completedAt: "desc" },
    include: {
      blockReviews: {
        select: {
          blockId: true,
          approved: true,
          suggestion: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
      finalAnswers: {
        select: {
          questionId: true,
          approved: true,
          comment: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const data = sessions.map((s) => ({
    id: s.id,
    pillarSlug: s.pillarSlug,
    status: s.status,
    startedAt: s.startedAt,
    completedAt: s.completedAt,
    ipAddress: s.ipAddress,
    blockReviews: s.blockReviews,
    finalAnswers: s.finalAnswers,
  }));

  const filename = pillar ? `content-reviews-${pillar}.json` : "content-reviews-all.json";

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
