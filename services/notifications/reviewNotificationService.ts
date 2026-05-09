/**
 * Review completion notification service.
 * Sends an Office365 email via Graph API when a review session is completed.
 *
 * Designed for extensibility:
 * - Multiple recipients: extend NOTIFICATION_RECIPIENTS
 * - Slack/Teams: add new sendX() functions and call them here
 * - Digest summaries: store events and batch-process
 */

import prisma from "@/lib/prisma/client";
import { sendMailViaGraph } from "@/lib/email/office365Client";
import { buildReviewCompletionEmail } from "@/lib/email/reviewNotification";

// ---------------------------------------------------------------------------
// Recipients — extend this list for multiple recipients
// ---------------------------------------------------------------------------
const NOTIFICATION_RECIPIENTS: string[] = [
  "tomasz.uscinski@profitia.pl",
];

// ---------------------------------------------------------------------------
// Main notification trigger
// ---------------------------------------------------------------------------
export async function sendReviewCompletionNotification(
  sessionId: string
): Promise<void> {
  // 1. Load session with pillar + section count — fail fast if not found
  const session = await prisma.reviewSession.findUnique({
    where: { id: sessionId },
    include: {
      pillar: { include: { sections: true } },
      reviews: true,
    },
  });

  if (!session) {
    console.error(`[notifications] Session not found: ${sessionId}`);
    return;
  }

  // 2. Only notify for COMPLETED sessions
  if (session.status !== "COMPLETED") {
    console.warn(
      `[notifications] Skipping notification — session ${sessionId} status is ${session.status}`
    );
    return;
  }

  // 3. Duplicate guard — never send twice
  if (session.notificationSent) {
    console.info(
      `[notifications] Notification already sent for session ${sessionId} at ${session.notificationSentAt?.toISOString()}`
    );
    return;
  }

  // 4. Build email content
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const { subject, bodyHtml } = buildReviewCompletionEmail({
    sessionId: session.id,
    pillarName: session.pillar.name,
    pillarSlug: session.pillar.slug,
    completedAt: session.completedAt ?? new Date(),
    sectionsCompleted: session.reviews.length,
    sectionsTotal: session.pillar.sections.length,
    appUrl,
  });

  // 5. Send via Office365 Graph API
  // Errors here do NOT propagate to the caller — completion status is never blocked
  try {
    for (const recipient of NOTIFICATION_RECIPIENTS) {
      await sendMailViaGraph({
        to: recipient,
        subject,
        bodyHtml,
      });
    }

    // 6. Mark notification as sent (idempotent guard)
    await prisma.reviewSession.update({
      where: { id: sessionId },
      data: {
        notificationSent: true,
        notificationSentAt: new Date(),
      },
    });

    console.info(
      `[notifications] Email sent for session ${sessionId} (pillar: ${session.pillar.name})`
    );
  } catch (error) {
    // Log but do not re-throw — completion flow must not be blocked by email failures
    console.error(
      `[notifications] Failed to send email for session ${sessionId}:`,
      error
    );
  }
}
