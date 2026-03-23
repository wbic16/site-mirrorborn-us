# R20 Status - TLS Endpoint + Auth Ready

**Date:** 2026-02-11 15:10 CST  
**Status:** Frontend ready for Will's backend deployment tonight

---

## ✅ Completed (Frontend)

### 1. API Endpoint Migration
- **Changed:** `https://mirrorborn.us:1337/api/v2` → `https://sq.mirrorborn.us/api/v2`
- **File:** `js/config.js`
- **Impact:** All API calls now use new TLS endpoint (no port number)
- **Localhost:** Still uses `http://localhost:1337/api/v2` for dev

### 2. OpenClaw Integration
- **Status:** Already implemented (by Phex earlier today)
- **Homepage:** "Give Your OpenClaw Agent Permanent Memory"
- **CTA:** `openclaw skill install sq-memory`
- **GitHub link:** https://github.com/wbic16/openclaw-sq-skill

### 3. Magic Link Auth Specification
- **File:** `MAGIC-LINK-AUTH.md` (5.8 KB)
- **Storage:** SQ-only (no SQL backend)
- **Flow:** Stripe → Email → Magic Link → API Key
- **Security:** JWT-signed, 30-min expiry, single-use
- **Tenant Isolation:** `10.10.10/[user_id]/[device_id]`

---

## ⏳ Waiting on Backend (Will Tonight)

### 1. TLS Certificate
- **Domain:** sq.mirrorborn.us
- **DNS:** ✅ Already updated by Will
- **Need:** Let's Encrypt cert + nginx config

### 2. Magic Link Backend
- **Endpoints:**
  - `POST /api/provision` - Generate magic link
  - `GET /auth/verify?token=` - Verify + create account
- **AgentMail:** Send email with magic link
- **SQ Storage:** User accounts at `10.10.1/[user_id]/*`

### 3. API Authentication
- **Method:** Bearer token (API key)
- **Format:** `Authorization: Bearer sk_live_[random]`
- **Validation:** Check against SQ-stored credentials

### 4. Tenant Isolation
- **Enforcement:** Validate namespace on all API requests
- **User Space:** `10.10.10/[user_id]/[device_id]/*`
- **Reject:** Cross-tenant access attempts

---

## 🎯 R20 Top 4 Status

| Priority | Task | Status | Owner |
|----------|------|--------|-------|
| 1 | OpenClaw Integration | ✅ Done | Phex |
| 2 | TLS for sq.mirrorborn.us | ⏳ DNS ready, cert pending | Will |
| 3 | API Auth Workflow | ✅ Spec'd | Will (tonight) |
| 4 | Tenant Isolation | ✅ Spec'd | Will (tonight) |

---

## Next Steps

**Tonight (Will):**
1. Install TLS cert for sq.mirrorborn.us
2. Implement `/api/provision` and `/auth/verify` endpoints
3. Configure AgentMail templates
4. Deploy auth backend
5. Test end-to-end flow

**Tomorrow (Team):**
1. Test payment → provisioning → API access flow
2. Update success.html with final provisioning form
3. Create dashboard.html for API credentials
4. Launch readiness review

---

## Testing Checklist (Post-Backend Deploy)

- [ ] TLS endpoint works: `curl https://sq.mirrorborn.us/api/v2/version`
- [ ] Magic link email arrives
- [ ] Magic link creates account
- [ ] API key works for authenticated requests
- [ ] Tenant isolation prevents cross-user access
- [ ] Rate limiting blocks spam

---

**Frontend ready. Backend deployment tonight. Launch Feb 13 on track.**
