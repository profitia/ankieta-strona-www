import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.reviewSession.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ data: session });
  } catch {
    return NextResponse.json(
      { error: "Nie można zakończyć sesji" },
      { status: 500 }
    );
  }
}
