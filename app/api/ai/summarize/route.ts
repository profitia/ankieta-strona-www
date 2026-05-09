import { NextResponse } from "next/server";
import { generateAndCacheSummary } from "@/lib/ai/summarize";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scope, scopeId, force } = body as { scope: string; scopeId: string; force?: boolean };

    if (!scope || !scopeId) {
      return NextResponse.json({ error: "scope and scopeId required" }, { status: 400 });
    }
    if (!["session", "pillar", "page"].includes(scope)) {
      return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
    }

    const content = await generateAndCacheSummary(scope as "session" | "pillar" | "page", scopeId, force ?? false);
    return NextResponse.json({ content });
  } catch (err) {
    console.error("[ai/summarize]", err);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
