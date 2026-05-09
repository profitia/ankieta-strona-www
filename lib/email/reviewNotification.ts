/**
 * Email templates for review completion notifications.
 */

export interface SectionScore {
  name: string;
  clarityScore: number;
  businessScore: number;
  trustScore: number;
  designScore: number;
  ctaScore: number;
  severity: string;
}

export interface ReviewCompletionData {
  sessionId: string;
  pillarName: string;
  pillarSlug: string;
  completedAt: Date;
  sectionsCompleted: number;
  sectionsTotal: number;
  sections?: SectionScore[];
  appUrl?: string;
}

const SEVERITY_LABELS: Record<string, string> = {
  LOW: "Drobna uwaga",
  MEDIUM: "Średnio istotny",
  HIGH: "Wysoce istotny",
  CRITICAL: "Priorytet krytyczny",
};

function sectionAvg(s: SectionScore): string {
  return ((s.clarityScore + s.businessScore + s.trustScore + s.designScore + s.ctaScore) / 5).toFixed(1);
}

export function buildReviewCompletionEmail(data: ReviewCompletionData): {
  subject: string;
  bodyHtml: string;
} {
  const subject = `Review ukończony — ${data.pillarName}`;

  const dateFormatted = data.completedAt.toLocaleString("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const adminLink = data.appUrl
    ? `${data.appUrl}/admin/reviews/${data.sessionId}`
    : null;

  const sectionsRows = data.sections && data.sections.length > 0
    ? data.sections.map((s) => {
        const avg = sectionAvg(s);
        const color = parseFloat(avg) >= 4 ? "#186B47" : parseFloat(avg) >= 3 ? "#7A5C00" : "#8E0055";
        return `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #F0F3F9; font-size: 13px; color: #242F44;">${s.name}</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #F0F3F9; font-size: 13px; color: #6B7894; text-align: center;">${s.clarityScore} · ${s.businessScore} · ${s.trustScore} · ${s.designScore} · ${s.ctaScore}</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #F0F3F9; font-size: 13px; font-weight: 600; color: ${color}; text-align: right; font-variant-numeric: tabular-nums;">${avg}</td>
          </tr>`;
      }).join("")
    : "";

  const sectionsTable = sectionsRows ? `
    <table cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 28px;">
      <thead>
        <tr>
          <th style="padding: 0 0 6px; font-size: 11px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase; color: #A6B2CC; text-align: left;">Sekcja</th>
          <th style="padding: 0 0 6px; font-size: 11px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase; color: #A6B2CC; text-align: center;">J · W · Z · D · CTA</th>
          <th style="padding: 0 0 6px; font-size: 11px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase; color: #A6B2CC; text-align: right;">Śr.</th>
        </tr>
      </thead>
      <tbody>${sectionsRows}</tbody>
    </table>` : "";

  const ctaRow = adminLink ? `
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background: #242F44; padding: 10px 20px;">
          <a href="${adminLink}" style="display: inline-block; color: #FFFFFF; font-size: 13px; font-weight: 500; text-decoration: none; letter-spacing: 0.02em;">Otwórz pełny raport</a>
        </td>
      </tr>
    </table>` : "";

  const bodyHtml = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #FFFFFF; border: 1px solid #DDE3EE;">

          <!-- Header -->
          <tr>
            <td style="padding: 28px 36px 22px; border-bottom: 1px solid #DDE3EE;">
              <p style="margin: 0 0 8px; font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #A6B2CC;">PROFITIA · REVIEW SYSTEM</p>
              <h1 style="margin: 0; font-size: 22px; font-weight: 300; color: #242F44; letter-spacing: -0.02em; line-height: 1.25;">Review ukończony</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 36px 0;">

              <!-- Meta -->
              <table cellpadding="0" cellspacing="0" style="width: 100%; border-top: 1px solid #DDE3EE; border-bottom: 1px solid #DDE3EE; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 8px 0; color: #6B7894; font-size: 13px; width: 160px;">Obszar</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 500; color: #242F44;">${data.pillarName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7894; font-size: 13px;">Data</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #242F44;">${dateFormatted}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7894; font-size: 13px;">Sekcje</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #242F44;">${data.sectionsCompleted} z ${data.sectionsTotal}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6B7894; font-size: 13px;">ID sesji</td>
                  <td style="padding: 8px 0; font-size: 12px; color: #A6B2CC; font-family: 'Courier New', monospace;">${data.sessionId}</td>
                </tr>
              </table>

              <!-- Scores by section -->
              ${sectionsTable}

              <!-- CTA -->
              ${ctaRow}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; border-top: 1px solid #DDE3EE; margin-top: 28px;">
              <p style="margin: 0; font-size: 11px; color: #A6B2CC; line-height: 1.6;">
                Wiadomość automatyczna — Profitia Review System.<br />
                Nie odpowiadaj na tę wiadomość.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, bodyHtml };
}
