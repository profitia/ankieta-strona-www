/**
 * Office365 Graph API client — server-side (client credentials grant).
 * Reuses the same Azure App Registration as Kampanie Apollo / Integracja z Office365.
 * Auth: client_credentials (no interactive login needed on server / Vercel).
 */

const GRAPH_ENDPOINT = "https://graph.microsoft.com/v1.0";
const TOKEN_URL_BASE = "https://login.microsoftonline.com";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface GraphMailPayload {
  to: string | string[];
  subject: string;
  bodyHtml: string;
  from?: string;
}

// Simple in-process token cache (reused within one serverless invocation lifetime)
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

async function acquireToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      "Missing Azure credentials: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET must be set"
    );
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
  });

  const response = await fetch(
    `${TOKEN_URL_BASE}/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Azure token acquisition failed (${response.status}): ${text}`);
  }

  const data: TokenResponse = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;
  return cachedToken;
}

export async function sendMailViaGraph(payload: GraphMailPayload): Promise<void> {
  const accessToken = await acquireToken();

  const mailFrom = payload.from ?? process.env.MAIL_FROM;
  if (!mailFrom) {
    throw new Error("MAIL_FROM environment variable is not set");
  }

  const recipients = Array.isArray(payload.to)
    ? payload.to
    : [payload.to];

  const graphPayload = {
    message: {
      subject: payload.subject,
      body: {
        contentType: "HTML",
        content: payload.bodyHtml,
      },
      toRecipients: recipients.map((address) => ({
        emailAddress: { address },
      })),
      from: {
        emailAddress: { address: mailFrom },
      },
    },
    saveToSentItems: true,
  };

  // Application permissions require sending as a specific user:
  // POST /users/{userId}/sendMail
  const encodedSender = encodeURIComponent(mailFrom);
  const url = `${GRAPH_ENDPOINT}/users/${encodedSender}/sendMail`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(graphPayload),
  });

  if (response.status !== 202) {
    const text = await response.text();
    throw new Error(`Graph API sendMail failed (${response.status}): ${text}`);
  }
}
