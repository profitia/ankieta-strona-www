import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { sendReviewCompletionNotification } from "@/services/notifications/reviewNotificationService";

const NOTIFICATION_TIMEOUT_MS = 8_000;

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

    // Await notification with a hard timeout so Vercel serverless does not
    // kill the process before the email is sent.  Failures are graceful —
    // completion status is never rolled back.
    try {
      await Promise.race([
        sendReviewCompletionNotification(session.id),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error("notification timeout")), NOTIFICATION_TIMEOUT_MS)
        ),
      ]);
    } catch (notifErr) {
      console.error("[complete] Notification failed (non-blocking):", notifErr);
    }

    return NextResponse.json({ data: session });
  } catch {
    return NextResponse.json(
      { error: "Nie można zakończyć sesji" },
      { status: 500 }
    );
  }
}
