/**
 * Email templates for review completion notifications.
 */

export interface ReviewCompletionData {
  sessionId: string;
  pillarName: string;
  pillarSlug: string;
  completedAt: Date;
  sectionsCompleted: number;
  sectionsTotal: number;
  appUrl?: string;
}

export function buildReviewCompletionEmail(data: ReviewCompletionData): {
  subject: string;
  bodyHtml: string;
} {
  const subject = "Nowe ukończone review strony Profitia";

  const dateFormatted = data.completedAt.toLocaleString("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const completionRate = data.sectionsTotal > 0
    ? Math.round((data.sectionsCompleted / data.sectionsTotal) * 100)
    : 0;

  const dashboardLink = data.appUrl
    ? `${data.appUrl}/dashboard/reviews`
    : null;

  const dashboardRow = dashboardLink
    ? `
      <tr>
        <td style="padding: 6px 0; color: #6B7894; font-size: 13px; width: 180px;">Panel administracyjny</td>
        <td style="padding: 6px 0; font-size: 13px;">
          <a href="${dashboardLink}" style="color: #006D9E; text-decoration: none;">${dashboardLink}</a>
        </td>
      </tr>`
    : "";

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
        <table width="600" cellpadding="0" cellspacing="0" style="background: #FFFFFF; border: 1px solid #DDE3EE; border-radius: 2px;">

          <!-- Header -->
          <tr>
            <td style="padding: 28px 36px 20px; border-bottom: 1px solid #DDE3EE;">
              <p style="margin: 0; font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #A6B2CC;">PROFITIA REVIEW SYSTEM</p>
              <h1 style="margin: 8px 0 0; font-size: 20px; font-weight: 300; color: #242F44; letter-spacing: -0.02em;">Ankieta ukończona</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 36px;">
              <p style="margin: 0 0 24px; font-size: 14px; color: #4A5568; line-height: 1.6;">
                Nowe review strony Profitia zostało ukończone. Poniżej szczegóły sesji.
              </p>

              <!-- Details table -->
              <table cellpadding="0" cellspacing="0" style="width: 100%; border-top: 1px solid #DDE3EE; border-bottom: 1px solid #DDE3EE; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 6px 0; color: #6B7894; font-size: 13px; width: 180px;">Obszar</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 500; color: #242F44;">${data.pillarName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6B7894; font-size: 13px;">Data i godzina</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #242F44;">${dateFormatted}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6B7894; font-size: 13px;">Sekcje ocenione</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #242F44;">${data.sectionsCompleted} z ${data.sectionsTotal} (${completionRate}%)</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6B7894; font-size: 13px;">ID sesji</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #A6B2CC; font-family: monospace;">${data.sessionId}</td>
                </tr>
                ${dashboardRow}
              </table>

              ${dashboardLink ? `
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: #006D9E; border-radius: 2px;">
                    <a href="${dashboardLink}" style="display: inline-block; padding: 10px 20px; color: #FFFFFF; font-size: 13px; font-weight: 500; text-decoration: none; letter-spacing: 0.02em;">Przejdź do panelu</a>
                  </td>
                </tr>
              </table>` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; border-top: 1px solid #DDE3EE;">
              <p style="margin: 0; font-size: 11px; color: #A6B2CC; line-height: 1.5;">
                Wiadomość automatyczna generowana przez Profitia Review System.<br />
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
