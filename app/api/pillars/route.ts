import { NextResponse } from "next/server";
import { getPillars } from "@/lib/db/pillars";
import prisma from "@/lib/prisma/client";
import { pillarSchema } from "@/lib/validations";

export async function GET() {
  try {
    const pillars = await getPillars();
    return NextResponse.json({ data: pillars });
  } catch {
    return NextResponse.json({ error: "Failed to fetch pillars" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = pillarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const pillar = await prisma.pillar.create({ data: parsed.data });
    return NextResponse.json({ data: pillar }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create pillar" }, { status: 500 });
  }
}
