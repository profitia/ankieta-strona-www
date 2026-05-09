/**
 * Office365 Graph API client — delegated auth via refresh token.
 *
 * Architecture:
 * - Uses the same Azure App Registration as Kampanie Apollo / Integracja z Office365
 * - App type: Public Client (no client_secret required for token refresh)
 * - Auth flow: OAuth2 refresh_token grant (no interactive login on server)
 * - Permissions: Delegated — Mail.Send ("Send mail as a user")
 * - Sends as: /me/sendMail (user context from token)
 *
 * Bootstrap:
 * 1. Initial auth done once via Python MSAL device flow (existing setup)
 * 2. Refresh token extracted from .token_cache.json → stored as AZURE_REFRESH_TOKEN env var
 * 3. Each invocation exchanges refresh token for access token (no user interaction)
 *
 * Refresh token lifetime:
 * Microsoft sliding window — remains valid as long as used within 90 days.
 * Rotate using scripts/refresh-token-rotate.mjs when needed.
 */

const GRAPH_ENDPOINT = "https://graph.microsoft.com/v1.0";
const TOKEN_ENDPOINT_BASE = "https://login.microsoftonline.com";
// Scope for delegated Mail.Send — offline_access ensures we get a usable token
const DELEGATED_SCOPE = "https://graph.microsoft.com/Mail.Send offline_access";

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface GraphMailPayload {
  to: string | string[];
  subject: string;
  bodyHtml: string;
}

// In-process access token cache (reused within one serverless invocation lifetime)
let cachedAccessToken: string | null = null;
let accessTokenExpiresAt: number = 0;

async function acquireTokenByRefreshToken(): Promise<string> {
  const now = Date.now();

  // Return cached access token if still valid (with 60s buffer)
  if (cachedAccessToken && now < accessTokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const refreshToken = process.env.AZURE_REFRESH_TOKEN;

  if (!tenantId || !clientId || !refreshToken) {
    throw new Error(
      "Missing Azure credentials: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_REFRESH_TOKEN must be set"
    );
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
    scope: DELEGATED_SCOPE,
  });

  // Public Client app — no client_secret required for refresh_token grant
  const response = await fetch(
    `${TOKEN_ENDPOINT_BASE}/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Azure token refresh failed (${response.status}): ${text}`
    );
  }

  const data: TokenResponse = await response.json();

  if (!data.access_token) {
    throw new Error("Azure token response did not include access_token");
  }

  cachedAccessToken = data.access_token;
  accessTokenExpiresAt = now + data.expires_in * 1000;

  return data.access_token;
}

export async function sendMailViaGraph(payload: GraphMailPayload): Promise<void> {
  const accessToken = await acquireTokenByRefreshToken();

  const mailFrom = process.env.MAIL_FROM;
  if (!mailFrom) {
    throw new Error("MAIL_FROM environment variable is not set");
  }

  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];

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

  // Delegated flow — /me/sendMail uses user context from the access token
  const response = await fetch(`${GRAPH_ENDPOINT}/me/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(graphPayload),
  });

  if (response.status !== 202) {
    const text = await response.text();
    throw new Error(`Graph API /me/sendMail failed (${response.status}): ${text}`);
  }
}

