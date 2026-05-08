import { NextResponse } from "next/server";
import { getPillarBySlug } from "@/lib/db/pillars";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const pillar = await getPillarBySlug(slug);

    if (!pillar) {
      return NextResponse.json(
        { error: "Nie znaleziono filaru" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: pillar });
  } catch {
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
