import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { getPillar } from "@/lib/content/contentDefinitions";

// POST /api/content-review/sessions — create new session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pillarSlug } = body;

    if (!pillarSlug || typeof pillarSlug !== "string") {
      return NextResponse.json({ error: "pillarSlug required" }, { status: 400 });
    }

    if (!getPillar(pillarSlug)) {
      return NextResponse.json({ error: "Unknown pillar slug" }, { status: 400 });
    }

    const headers = request.headers;
    const ip =
      headers.get("x-vercel-forwarded-for") ??
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null;
    const city = headers.get("x-vercel-ip-city")
      ? decodeURIComponent(headers.get("x-vercel-ip-city")!)
      : null;
    const country = headers.get("x-vercel-ip-country") ?? null;

    const session = await prisma.contentSession.create({
      data: { pillarSlug, ipAddress: ip, city, country },
    });

    return NextResponse.json({ data: session }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

// GET /api/content-review/sessions?id=... — fetch single session
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const session = await prisma.contentSession.findUnique({
      where: { id },
      include: {
        blockReviews: true,
        finalAnswers: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ data: session });
  } catch {
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
