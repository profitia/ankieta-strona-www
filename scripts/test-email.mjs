// Quick test of the refresh token flow
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
const envContent = readFileSync(join(__dirname, '../.env'), 'utf8');
for (const line of envContent.split('\n')) {
  const m = line.match(/^([A-Z_]+)="?([^"]+)"?$/);
  if (m) process.env[m[1]] = m[2];
}

const { AZURE_TENANT_ID: tenantId, AZURE_CLIENT_ID: clientId, AZURE_REFRESH_TOKEN: refreshToken, MAIL_FROM: mailFrom } = process.env;

console.log('tenantId:', tenantId ? 'ok' : 'MISSING');
console.log('clientId:', clientId ? 'ok' : 'MISSING');
console.log('refreshToken:', refreshToken ? refreshToken.slice(0, 40) + '...' : 'MISSING');
console.log('mailFrom:', mailFrom);

if (!tenantId || !clientId || !refreshToken) {
  console.error('Missing env vars — aborting');
  process.exit(1);
}

// Step 1: Exchange refresh token for access token
const params = new URLSearchParams({
  grant_type: 'refresh_token',
  client_id: clientId,
  refresh_token: refreshToken,
  scope: 'https://graph.microsoft.com/Mail.Send offline_access',
});

console.log('\n→ Exchanging refresh token...');
const tokenResp = await fetch(
  `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  }
);

const tokenData = await tokenResp.json();

if (!tokenData.access_token) {
  console.error('Token FAILED:', JSON.stringify(tokenData, null, 2));
  process.exit(1);
}

console.log('✓ Token OK — expires_in:', tokenData.expires_in, '| new_refresh_token:', !!tokenData.refresh_token);

// Step 2: Test /me/sendMail
const mailPayload = {
  message: {
    subject: '[TEST] Profitia Review — weryfikacja delegated auth',
    body: {
      contentType: 'HTML',
      content: '<p>Test wysyłki z delegated auth (refresh token). Jeśli widzisz tę wiadomość — integracja działa poprawnie.</p>',
    },
    toRecipients: [{ emailAddress: { address: mailFrom } }],
    from: { emailAddress: { address: mailFrom } },
  },
  saveToSentItems: true,
};

console.log('\n→ Sending test email via /me/sendMail...');
const mailResp = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${tokenData.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(mailPayload),
});

if (mailResp.status === 202) {
  console.log('✓ Email sent successfully!');
} else {
  const text = await mailResp.text();
  console.error(`✗ sendMail failed (${mailResp.status}):`, text);
}
