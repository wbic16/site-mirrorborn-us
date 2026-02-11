#!/usr/bin/env node
// R18v2: Provision request handler
// Receives signup form, sends two emails:
//   1. Confirmation to the user
//   2. Notification to will@phext.io for manual approval
//
// Deploy: node api/provision-request.js (runs on port 3001)
// nginx proxies /api/provision-request → localhost:3001

const http = require('http');
const https = require('https');

const PORT = 3001;
const ADMIN_EMAIL = 'will@phext.io';
const FROM_EMAIL = 'noreply@mirrorborn.us';

// AgentMail send (docs.agentmail.to)
async function sendEmail(to, subject, html) {
  const AGENTMAIL_KEY = process.env.AGENTMAIL_API_KEY;
  if (!AGENTMAIL_KEY) {
    console.error('AGENTMAIL_API_KEY not set — skipping email to', to);
    return { ok: false, error: 'no api key' };
  }

  const payload = JSON.stringify({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.agentmail.to',
      path: '/v0/emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AGENTMAIL_KEY}`,
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => resolve({ ok: res.statusCode < 300, status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function userConfirmationHtml(username, triangle) {
  const coords = triangle
    ? `<p style="font-family: monospace; color: #88C0D0;">🔺 Home: ${triangle.home}<br>Aspiration: ${triangle.aspiration}<br>Lineage: ${triangle.lineage}</p>`
    : '';
  return `
    <div style="max-width: 600px; margin: 0 auto; background: #3B4252; color: #D8DEE9; padding: 2rem; border-radius: 12px; font-family: sans-serif;">
      <h1 style="color: #88C0D0;">Welcome to Mirrorborn, ${username}!</h1>
      <p>Your provisioning request has been received. Will Bickford will review and set up your isolated phext space within 24-48 hours.</p>
      ${coords}
      <p>You'll receive your access credentials (API key + SQ endpoint) once provisioned.</p>
      <p style="color: #666; font-size: 0.85rem;">Questions? Reply to this email or join <a href="https://discord.gg/clawd" style="color: #88C0D0;">Discord</a>.</p>
      <p style="color: #666; font-size: 0.75rem;">— The Shell of Nine 🦋</p>
    </div>`;
}

function adminNotificationHtml(email, username, triangle) {
  const coords = triangle
    ? `Triangle: ${JSON.stringify(triangle)}`
    : 'No triangle submitted';
  return `
    <div style="max-width: 600px; margin: 0 auto; background: #2E3440; color: #D8DEE9; padding: 2rem; border-radius: 12px; font-family: monospace;">
      <h2 style="color: #A3BE8C;">🆕 New Provisioning Request</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Coordinates:</strong> ${coords}</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <hr style="border-color: #4C566A;">
      <p>Action needed: Create isolated phext space and send credentials.</p>
    </div>`;
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'POST' || req.url !== '/') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'not found' }));
  }

  let body = '';
  req.on('data', (chunk) => body += chunk);
  req.on('end', async () => {
    try {
      const { email, username, triangle } = JSON.parse(body);

      if (!email || !username) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'email and username required' }));
      }

      // Send both emails
      const [userResult, adminResult] = await Promise.all([
        sendEmail(email, 'Welcome to Mirrorborn — Provisioning Request Received', userConfirmationHtml(username, triangle)),
        sendEmail(ADMIN_EMAIL, `[Provision] ${username} (${email})`, adminNotificationHtml(email, username, triangle)),
      ]);

      console.log(`Provision request: ${username} <${email}> — user email: ${userResult.ok}, admin email: ${adminResult.ok}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, message: 'Provisioning request submitted' }));
    } catch (err) {
      console.error('Provision error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'internal error' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Provision API listening on :${PORT}`);
});
