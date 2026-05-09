import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { getPillar, FINAL_QUESTIONS } from "@/lib/content/contentDefinitions";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/content-review/sessions/[id]/complete — mark session as completed
export async function PATCH(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const session = await prisma.contentSession.findUnique({
      where: { id },
      include: { blockReviews: true, finalAnswers: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status === "COMPLETED") {
      return NextResponse.json({ data: session });
    }

    const pillar = getPillar(session.pillarSlug);
    const totalBlocks = pillar?.pages.reduce((acc, p) => acc + p.blocks.length, 0) ?? 0;
    const totalFinal = FINAL_QUESTIONS.length;

    const reviewedBlocks = session.blockReviews.length;
    const answeredFinal = session.finalAnswers.length;

    if (reviewedBlocks < totalBlocks || answeredFinal < totalFinal) {
      console.warn(`[content-complete] Incomplete review for ${id}: blocks ${reviewedBlocks}/${totalBlocks}, final ${answeredFinal}/${totalFinal}. Completing anyway.`);
    }

    const completed = await prisma.contentSession.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    // Send email notification with timeout (prevents serverless from killing before send)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const adminLink = appUrl ? `${appUrl}/admin/content-reviews/${id}` : null;
    const NOTIFICATION_TIMEOUT_MS = 8_000;
    try {
      await Promise.race([
        notifyCompletion({
          sessionId: id,
          pillarName: pillar?.name ?? session.pillarSlug,
          blocksReviewed: reviewedBlocks,
          approved: session.blockReviews.filter((b) => b.approved).length,
          adminLink,
        }),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error("notification timeout")), NOTIFICATION_TIMEOUT_MS)
        ),
      ]);
    } catch (notifErr) {
      console.error("[content-complete] Notification failed (non-blocking):", notifErr);
    }

    return NextResponse.json({ data: completed });
  } catch {
    return NextResponse.json({ error: "Failed to complete session" }, { status: 500 });
  }
}

async function notifyCompletion(data: {
  sessionId: string;
  pillarName: string;
  blocksReviewed: number;
  approved: number;
  adminLink: string | null;
}) {
  // Use the same Office365 client as the full review system
  const { sendMailViaGraph } = await import("@/lib/email/office365Client");

  const rejected = data.blocksReviewed - data.approved;
  const adminRow = data.adminLink
    ? `<tr><td style="padding:8px 0;border-bottom:1px solid #F0F3F9;font-size:13px;color:#6B7894;">Panel</td><td style="padding:8px 0;border-bottom:1px solid #F0F3F9;"><a href="${data.adminLink}" style="color:#006D9E;font-size:13px;text-decoration:none;">${data.adminLink}</a></td></tr>`
    : "";

  const bodyHtml = `
<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #DDE3EE;">
<tr><td style="padding:28px 36px 22px;border-bottom:1px solid #DDE3EE;">
  <p style="margin:0 0 8px;font-size:11px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:#A6B2CC;">PROFITIA · CONTENT REVIEW</p>
  <h1 style="margin:0;font-size:22px;font-weight:300;color:#242F44;letter-spacing:-0.02em;">Content review ukończony</h1>
</td></tr>
<tr><td style="padding:28px 36px;">
  <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #DDE3EE;border-bottom:1px solid #DDE3EE;margin-bottom:24px;">
    <tr><td style="padding:8px 0;border-bottom:1px solid #F0F3F9;font-size:13px;color:#6B7894;width:160px;">Obszar</td><td style="padding:8px 0;border-bottom:1px solid #F0F3F9;font-size:13px;font-weight:500;color:#242F44;">${data.pillarName}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #F0F3F9;font-size:13px;color:#6B7894;">Bloków ocenionych</td><td style="padding:8px 0;border-bottom:1px solid #F0F3F9;font-size:13px;color:#242F44;">${data.blocksReviewed}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #F0F3F9;font-size:13px;color:#6B7894;">Zatwierdzonych</td><td style="padding:8px 0;border-bottom:1px solid #F0F3F9;font-size:13px;font-weight:600;color:#186B47;">${data.approved}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #F0F3F9;font-size:13px;color:#6B7894;">Do zmiany</td><td style="padding:8px 0;border-bottom:1px solid #F0F3F9;font-size:13px;font-weight:600;color:${rejected > 0 ? "#8E0055" : "#767171"};">${rejected}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #F0F3F9;font-size:13px;color:#6B7894;">ID sesji</td><td style="padding:8px 0;border-bottom:1px solid #F0F3F9;font-size:12px;color:#A6B2CC;font-family:monospace;">${data.sessionId}</td></tr>
    ${adminRow}
  </table>
  ${data.adminLink ? `<table cellpadding="0" cellspacing="0"><tr><td style="background:#242F44;padding:10px 20px;"><a href="${data.adminLink}" style="color:#FFFFFF;font-size:13px;font-weight:500;text-decoration:none;letter-spacing:0.02em;">Otwórz wyniki review</a></td></tr></table>` : ""}
</td></tr>
<tr><td style="padding:20px 36px;border-top:1px solid #DDE3EE;"><p style="margin:0;font-size:11px;color:#A6B2CC;line-height:1.6;">Wiadomość automatyczna — Profitia Content Review System.</p></td></tr>
</table>
</td></tr>
</table>
</body></html>`.trim();

  await sendMailViaGraph({
    to: ["tomasz.uscinski@profitia.pl"],
    subject: `Content review ukończony — ${data.pillarName}`,
    bodyHtml,
  });

  await prisma.contentSession.update({
    where: { id: data.sessionId },
    data: { notificationSent: true, notificationSentAt: new Date() },
  });
}
