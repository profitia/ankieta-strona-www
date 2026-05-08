import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { reviewSessionSchema, sectionReviewSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  try {
    if (sessionId) {
      const session = await prisma.reviewSession.findUnique({
        where: { id: sessionId },
        include: { reviews: { include: { section: true } }, pillar: true },
      });

      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      return NextResponse.json({ data: session });
    }

    const sessions = await prisma.reviewSession.findMany({
      include: { pillar: true, reviews: { select: { id: true } } },
      orderBy: { startedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ data: sessions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Create a new session
    if ("pillarId" in body && !("sessionId" in body)) {
      const parsed = reviewSessionSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      }

      const session = await prisma.reviewSession.create({
        data: { ...parsed.data, status: "IN_PROGRESS" },
      });

      return NextResponse.json({ data: session }, { status: 201 });
    }

    // Upsert a section review
    const parsed = sectionReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { sessionId, sectionId, ...fields } = parsed.data;

    const review = await prisma.sectionReview.upsert({
      where: { sessionId_sectionId: { sessionId, sectionId } },
      update: fields,
      create: { sessionId, sectionId, ...fields },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Nie można zapisać oceny" }, { status: 500 });
  }
}
