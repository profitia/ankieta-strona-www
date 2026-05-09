import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

type Params = { params: Promise<{ id: string }> };

// POST /api/content-review/sessions/[id]/blocks — upsert block decision
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { blockId, approved, suggestion } = body;

    if (typeof blockId !== "string" || typeof approved !== "boolean") {
      return NextResponse.json({ error: "blockId (string) and approved (boolean) required" }, { status: 400 });
    }

    const session = await prisma.contentSession.findUnique({ where: { id } });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const review = await prisma.contentBlockReview.upsert({
      where: { sessionId_blockId: { sessionId: id, blockId } },
      update: { approved, suggestion: suggestion ?? null },
      create: { sessionId: id, blockId, approved, suggestion: suggestion ?? null },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save block review" }, { status: 500 });
  }
}

// GET /api/content-review/sessions/[id]/blocks — list all decisions for session
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const reviews = await prisma.contentBlockReview.findMany({
      where: { sessionId: id },
    });
    return NextResponse.json({ data: reviews });
  } catch {
    return NextResponse.json({ error: "Failed to fetch block reviews" }, { status: 500 });
  }
}
