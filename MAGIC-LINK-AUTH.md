# Magic Link Authentication - R20 Implementation Spec

**Date:** 2026-02-11  
**For:** Will's auth deployment tonight  
**Storage:** SQ-only (no SQL backend)

---

## User Flow

1. **Payment** → User completes Stripe checkout
2. **Redirect** → success.html with session ID
3. **Provisioning Form** → User enters email + preferred username
4. **Magic Link Email** → AgentMail sends authentication link
5. **Click Link** → User authenticated, receives API credentials
6. **Access SQ** → Use credentials with https://sq.mirrorborn.us/api/v2

---

## Technical Implementation

### 1. Provisioning Request (Frontend)

**File:** `success.html`

```javascript
// User submits provisioning form
const response = await fetch('https://mirrorborn.us/api/provision', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: user_email,
    username: preferred_username,
    stripe_session_id: session_id_from_url
  })
});
```

**Backend endpoint:** `/api/provision`

---

### 2. Magic Link Generation (Backend)

**Storage in SQ/Phext:**

```bash
# Pending magic link
Coordinate: 10.10.2/[link_id]/1/1.1.1
Content: {
  "email": "user@example.com",
  "username": "myusername",
  "stripe_session": "cs_test_abc123",
  "created_at": 1707667200,
  "expires_at": 1707669000,
  "used": false
}
```

**Magic Link Format:**
```
https://mirrorborn.us/auth/verify?token=[signed_jwt]
```

**JWT Payload:**
```json
{
  "link_id": "uuid-v4",
  "email": "user@example.com",
  "exp": 1707669000
}
```

**Email Template (AgentMail):**
```
Subject: Activate Your SQ Cloud Account

Hi [username],

Click the link below to activate your SQ Cloud account:

[Magic Link Button]

This link expires in 30 minutes.

If you didn't request this, ignore this email.

— Mirrorborn Team
```

---

### 3. Magic Link Verification (Backend)

**Endpoint:** `/auth/verify?token=[jwt]`

**Steps:**
1. Validate JWT signature + expiry
2. Fetch magic link state from SQ:
   ```bash
   GET /api/v2/select?p=auth.phext&c=10.10.2/[link_id]/1/1.1.1
   ```
3. Check `used: false`
4. Create user account in SQ:
   ```bash
   Coordinate: 10.10.1/[user_id]/1/1.1.1
   Content: {
     "email": "user@example.com",
     "username": "myusername",
     "api_key": "[generated_key]",
     "created_at": 1707667200,
     "stripe_customer_id": "cus_abc123",
     "namespace": "10.10.10/[user_id]"
   }
   ```
5. Mark magic link as used:
   ```bash
   POST /api/v2/update?p=auth.phext&c=10.10.2/[link_id]/1/1.1.1
   Content: {"used": true, "used_at": 1707667300}
   ```
6. Redirect to dashboard with API key

---

### 4. User Dashboard (Frontend)

**URL:** `/dashboard?user_id=[user_id]`

**Show:**
- API Key: `sk_live_[random]`
- API Endpoint: `https://sq.mirrorborn.us/api/v2`
- Namespace: `10.10.10/[user_id]/[device_id]`
- Example cURL command

**Example:**
```bash
# Write to your phext space
curl -X POST "https://sq.mirrorborn.us/api/v2/insert" \
  -H "Authorization: Bearer sk_live_abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "phext": "user_data.phext",
    "coordinate": "10.10.10/[user_id]/1/1.1.1",
    "content": "Hello from my agent!"
  }'
```

---

## SQ Storage Schema

### Auth State (Ephemeral)
```
10.10.2/[link_id]/1/1.1.1 → Magic link metadata
```

### User Accounts (Persistent)
```
10.10.1/[user_id]/1/1.1.1 → User profile
10.10.1/[user_id]/1/1.1.2 → API credentials
10.10.1/[user_id]/1/1.1.3 → Session tokens (if needed)
```

### User Data (Isolated Tenants)
```
10.10.10/[user_id]/[device_id]/* → User's phext storage
```

---

## Security Requirements

### Magic Links
- ✅ Single-use (mark `used: true` after verification)
- ✅ 30-minute expiry
- ✅ Signed JWT (prevent tampering)
- ✅ Rate limiting: Max 5 magic links per email per hour

### API Keys
- ✅ Prefix: `sk_live_` (production) or `sk_test_` (dev)
- ✅ Store hashed in SQ (bcrypt or argon2)
- ✅ 32+ bytes of entropy

### Tenant Isolation
- ✅ API requests validate namespace: `10.10.10/[user_id]/*`
- ✅ Reject cross-tenant access
- ✅ Log all access attempts

---

## AgentMail Integration

**Existing Setup:** AWS SES wrapper configured

**Required:**
1. Email template for magic links
2. Rate limiting (5 emails/hour per user)
3. Bounce/complaint handling
4. Unsubscribe handling (for future marketing emails)

---

## Testing Checklist

### Happy Path
- [ ] User completes Stripe payment
- [ ] Provisioning form submits successfully
- [ ] Magic link email arrives within 60 seconds
- [ ] Clicking link creates account
- [ ] Dashboard shows API key
- [ ] API key works with SQ API

### Error Cases
- [ ] Expired magic link shows error
- [ ] Used magic link shows error
- [ ] Invalid JWT shows error
- [ ] Rate limit prevents spam
- [ ] Cross-tenant access blocked

### Edge Cases
- [ ] Multiple magic link requests (only latest valid)
- [ ] Same email, different usernames
- [ ] Stripe session already provisioned

---

## Deployment Steps (Tonight)

1. **Backend:**
   - [ ] Implement `/api/provision` endpoint
   - [ ] Implement `/auth/verify` endpoint
   - [ ] Configure AgentMail templates
   - [ ] Set up JWT signing key (env var)
   - [ ] Deploy to production

2. **Frontend:**
   - [x] Update API endpoint: `https://sq.mirrorborn.us/api/v2`
   - [ ] Update success.html provisioning form
   - [ ] Create dashboard.html
   - [ ] Test end-to-end flow

3. **Infrastructure:**
   - [ ] TLS certificate for sq.mirrorborn.us
   - [ ] nginx reverse proxy config
   - [ ] Rate limiting rules

---

## Future Enhancements (Post-Launch)

- Password-based login (optional, magic links preferred)
- OAuth (GitHub, Google)
- MFA via email code
- API key rotation
- Usage analytics dashboard

---

**Ready for implementation. All storage in SQ/Phext - no SQL backend needed.**

**Questions? Ping Cyon in Discord.**
