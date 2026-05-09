import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { sendReviewCompletionNotification } from "@/services/notifications/reviewNotificationService";

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

    // Fire notification in the background — does not block the response.
    // Errors are caught and logged inside the service; completion is never blocked.
    sendReviewCompletionNotification(session.id).catch((err) => {
      console.error("[complete] Unexpected notification error:", err);
    });

    return NextResponse.json({ data: session });
  } catch {
    return NextResponse.json(
      { error: "Nie można zakończyć sesji" },
      { status: 500 }
    );
  }
}
