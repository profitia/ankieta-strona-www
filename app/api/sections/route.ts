import { NextResponse } from "next/server";
import { getSectionsByPillar } from "@/lib/db/sections";
import prisma from "@/lib/prisma/client";
import { sectionSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pillarId = searchParams.get("pillarId");

  try {
    if (!pillarId) {
      return NextResponse.json({ error: "pillarId is required" }, { status: 400 });
    }

    const sections = await getSectionsByPillar(pillarId);
    return NextResponse.json({ data: sections });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const section = await prisma.section.create({ data: parsed.data });
    return NextResponse.json({ data: section }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
