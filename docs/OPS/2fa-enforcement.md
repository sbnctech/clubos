# Two-Factor Authentication (2FA) Enforcement

This document describes ClubOS's mandatory 2FA enforcement system for privileged administrative roles.

## Overview

ClubOS enforces two-factor authentication (2FA) for roles that have access to:

- Personally Identifiable Information (PII)
- Financial data
- Data exports
- Privilege escalation capabilities
- Communication sending

## Charter Principles

- **P1: Identity Provable** - 2FA adds a second authentication factor
- **P2: Default Deny** - Privileged access blocked without 2FA
- **P7: Observability** - All 2FA events are audited
- **P9: Fail Closed** - Missing/expired 2FA verification blocks access

## Enforcement Rules

### Capabilities Requiring 2FA

The following capabilities require 2FA:

| Capability | Description |
|------------|-------------|
| `admin:full` | Full administrative access |
| `members:view` | View member PII |
| `members:history` | View member service history |
| `finance:view` | View financial data |
| `finance:manage` | Manage financial data |
| `exports:access` | Export data (bulk PII/financial) |
| `users:manage` | Manage user roles/entitlements |
| `comms:send` | Send communications |

### Roles Requiring 2FA

A role requires 2FA if it has **any** capability from the list above:

| Role | Requires 2FA | Reason |
|------|--------------|--------|
| `admin` | Yes | Has `admin:full` |
| `president` | Yes | Has `members:view`, `finance:view`, etc. |
| `past-president` | Yes | Has `members:view` |
| `vp-activities` | Yes | Has `members:view` |
| `event-chair` | Yes | Has `members:view` |
| `webmaster` | No | Only has `publishing:manage`, `comms:manage` |
| `member` | No | No sensitive capabilities |

## 2FA Session Duration

- Session duration: **8 hours**
- After 8 hours, step-up authentication is required for sensitive operations
- Session starts fresh after each successful verification

## User Flows

### 1. Enrollment Flow

For users who haven't enrolled in 2FA:

1. User attempts to access a protected resource
2. System returns 403 with `code: "2FA_ENROLLMENT_REQUIRED"`
3. User calls `POST /api/v1/auth/2fa/enroll` to begin enrollment
4. System returns QR code URI and backup codes
5. User scans QR code with authenticator app
6. User calls `POST /api/v1/auth/2fa/enroll/confirm` with TOTP code
7. Enrollment complete - user can now access protected resources

### 2. Verification Flow (Step-up Auth)

For users with 2FA enabled but expired session:

1. User attempts to access a protected resource
2. System returns 403 with `code: "2FA_VERIFICATION_REQUIRED"`
3. User calls `POST /api/v1/auth/2fa/verify` with TOTP code
4. System updates `twoFactorVerifiedAt` timestamp
5. User can access protected resources for 8 hours

## API Endpoints

### `POST /api/v1/auth/2fa/enroll`

Begin 2FA enrollment. Returns QR code URI and backup codes.

**Response:**
```json
{
  "qrCodeUri": "otpauth://totp/SBNC%20ClubOS:user@example.com?...",
  "backupCodes": ["XXXX-XXXX", "XXXX-XXXX", ...]
}
```

### `POST /api/v1/auth/2fa/enroll/confirm`

Complete enrollment by verifying first TOTP code.

**Request:**
```json
{
  "code": "123456"
}
```

### `POST /api/v1/auth/2fa/verify`

Verify TOTP or backup code for step-up authentication.

**Request:**
```json
{
  "code": "123456"
}
```

### `GET /api/v1/auth/2fa/status`

Get current user's 2FA status.

**Response:**
```json
{
  "twoFactorEnabled": true,
  "enrolledAt": "2025-01-15T10:00:00Z",
  "lastVerifiedAt": "2025-01-15T14:00:00Z",
  "backupCodesRemaining": 8,
  "enforcement": {
    "required": true,
    "enrolled": true,
    "verified": true,
    "action": "none"
  }
}
```

### `GET /api/v1/admin/2fa/compliance`

Admin dashboard showing 2FA compliance status.

**Response:**
```json
{
  "compliance": {
    "totalRequiring": 10,
    "compliantCount": 8,
    "nonCompliantCount": 2,
    "complianceRate": 80,
    "complianceRatePercent": "80%"
  },
  "compliantUsers": [...],
  "nonCompliantUsers": [...],
  "roleRequirements": [...]
}
```

### `POST /api/v1/admin/2fa/disable`

Admin endpoint to disable 2FA for a user (e.g., lost phone).

**Request:**
```json
{
  "userAccountId": "uuid",
  "reason": "User lost phone, verified via email and ID"
}
```

## Audit Events

All 2FA actions are logged:

| Event | Description |
|-------|-------------|
| `TWO_FACTOR_ENROLLED` | User completed 2FA enrollment |
| `TWO_FACTOR_VERIFIED` | User verified TOTP code |
| `TWO_FACTOR_DISABLED` | Admin disabled user's 2FA |
| `TWO_FACTOR_REQUIRED_BLOCK` | Access blocked due to missing 2FA |
| `TWO_FACTOR_BACKUP_USED` | User used a backup code |

## Backup Codes

- 10 backup codes generated during enrollment
- Each code is single-use
- Codes are 8 uppercase hex characters (e.g., `1A2B-3C4D`)
- Stored as SHA-256 hashes
- Warning shown when backup code is used

## Integration for Developers

### Using the Guard in API Routes

```typescript
import { require2FA, requireCapabilityWith2FA } from "@/lib/auth/2fa";

// Option 1: Require 2FA for entire route (role-based)
export async function GET(request: NextRequest) {
  const auth = await require2FA(request);
  if (!auth.ok) return auth.response;

  // auth.context contains user info
  // auth.twoFactorVerified indicates 2FA status
}

// Option 2: Require 2FA for specific capability
export async function POST(request: NextRequest) {
  const auth = await requireCapabilityWith2FA(request, "finance:view");
  if (!auth.ok) return auth.response;

  // Capability and 2FA both verified
}
```

## Backout Plan

To disable 2FA enforcement in an emergency:

1. **Individual user**: Use admin disable endpoint with documented reason
2. **System-wide**: Remove capabilities from `CAPABILITIES_REQUIRING_2FA` in `src/lib/auth/2fa/enforcement.ts`
3. **Database**: Set `twoFactorEnabled = false` for affected users (last resort)

All changes should be documented in audit logs with reason.

## Security Considerations

- TOTP secrets are stored encrypted
- Backup codes are SHA-256 hashed
- Failed verification attempts should be rate-limited
- 2FA session persists across page reloads but expires after 8 hours
- Admin disable action requires documented reason and is audited
