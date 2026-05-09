import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { FINAL_QUESTIONS } from "@/lib/content/contentDefinitions";

type Params = { params: Promise<{ id: string }> };

// POST /api/content-review/sessions/[id]/final — upsert final question answer
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { questionId, approved, comment } = body;

    if (typeof questionId !== "string" || typeof approved !== "boolean") {
      return NextResponse.json({ error: "questionId (string) and approved (boolean) required" }, { status: 400 });
    }

    const validIds = FINAL_QUESTIONS.map((q) => q.id);
    if (!validIds.includes(questionId as typeof FINAL_QUESTIONS[number]["id"])) {
      return NextResponse.json({ error: `questionId must be one of: ${validIds.join(", ")}` }, { status: 400 });
    }

    const session = await prisma.contentSession.findUnique({ where: { id } });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const answer = await prisma.contentFinalAnswer.upsert({
      where: { sessionId_questionId: { sessionId: id, questionId } },
      update: { approved, comment: comment ?? null },
      create: { sessionId: id, questionId, approved, comment: comment ?? null },
    });

    return NextResponse.json({ data: answer }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save final answer" }, { status: 500 });
  }
}
