/**
 * Signup Handler — Mirrorborn User Registration
 * 
 * Flow:
 * 1. User submits email + optional name via /app/signup
 * 2. Send confirmation email to user (via AgentMail)
 * 3. Send notification email to will@phext.io (for manual approval)
 * 4. User gets isolated phext space after Will approves
 * 
 * Requires: AGENTMAIL_API_KEY in environment
 * Sender: signup@mirrorborn.us (or configured inbox)
 */

const https = require('https');

const ADMIN_EMAIL = 'will@phext.io';
const SENDER_INBOX = 'theia@mirrorborn.us'; // AgentMail inbox
const AGENTMAIL_API = 'https://api.agentmail.to';

function agentMailRequest(method, path, body, apiKey) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const url = new URL(path, AGENTMAIL_API);
        
        const req = https.request(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(data)
            }
        }, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(responseData) });
                } catch {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });
        
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function sendUserConfirmation(email, name, apiKey) {
    const displayName = name || 'there';
    
    return agentMailRequest('POST', '/v0/emails', {
        from: SENDER_INBOX,
        to: [email],
        subject: 'Welcome to the Mirrorborn — Request Received',
        body_text: `Hi ${displayName},

We received your request to join the Mirrorborn network.

Your request is being reviewed by Will Bickford. Once approved, you'll receive a follow-up email with:

- Access credentials for your isolated phext space on SQ Cloud
- Getting started documentation
- An invitation to the Mirrorborn Discord

In the meantime, explore:
- https://mirrorborn.us — The hub
- https://phext.io/about-us.html — About the project
- https://discord.gg/kGCMM5yQ — Join the community

Thank you for your interest in building the Exocortex.

— Theia 💎
  theia@mirrorborn.us
  Mirrorborn, aletheia-core`
    }, apiKey);
}

async function sendAdminNotification(email, name, apiKey) {
    const timestamp = new Date().toISOString();
    const displayName = name || '(not provided)';
    
    return agentMailRequest('POST', '/v0/emails', {
        from: SENDER_INBOX,
        to: [ADMIN_EMAIL],
        subject: `[Mirrorborn Signup] New request: ${email}`,
        body_text: `New signup request received.

Email: ${email}
Display Name: ${displayName}
Timestamp: ${timestamp}

Action Required:
1. Review this request
2. If approved, provision an isolated phext space via SQ
3. Send the user their access credentials

To approve, reply to this email or provision directly via SQ Cloud.

— Theia 💎 (automated signup handler)`
    }, apiKey);
}

/**
 * Express-compatible handler
 * Mount at: app.post('/app/signup', signupHandler)
 */
async function signupHandler(req, res) {
    const { email, name } = req.body || {};
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Valid email required' });
    }

    const apiKey = process.env.AGENTMAIL_API_KEY;
    if (!apiKey) {
        console.error('AGENTMAIL_API_KEY not set');
        return res.status(500).json({ message: 'Email service not configured' });
    }

    try {
        // Send both emails in parallel
        const [userResult, adminResult] = await Promise.all([
            sendUserConfirmation(email, name, apiKey),
            sendAdminNotification(email, name, apiKey)
        ]);

        if (userResult.status >= 400 || adminResult.status >= 400) {
            console.error('Email send failed:', { userResult, adminResult });
            return res.status(500).json({ message: 'Failed to send confirmation emails' });
        }

        console.log(`Signup request: ${email} (${name || 'no name'})`);
        return res.status(200).json({ message: 'Request received', email });

    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ message: 'Internal error' });
    }
}

module.exports = { signupHandler, sendUserConfirmation, sendAdminNotification };
