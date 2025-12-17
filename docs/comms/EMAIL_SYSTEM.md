# Email System Documentation

## Overview

The ClubOS email system provides a complete solution for composing and sending emails using sbnewcomers.org addresses. It includes:

- **Email Identities**: Manage from-addresses with role-based access control
- **Message Templates**: Reusable templates with variable substitution
- **Email Composer**: Interface for composing and sending emails
- **Outbox**: Track email delivery status

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Email Identity │────▶│  Email Composer │────▶│  Email Outbox   │
│  (from-address) │     │  (templates +   │     │  (status track) │
│  Role-based     │     │   recipients)   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  SMTP Provider  │
                        │  (stub in dev)  │
                        └─────────────────┘
```

## Email Identities

### What They Are

Email identities represent the "from" addresses available for sending emails (e.g., `president@sbnewcomers.org`). Each identity has:

- **Email**: The actual email address
- **Display Name**: Shown in email clients (e.g., "SBNC President")
- **Allowed Roles**: Which roles can send using this identity
- **Reply-To**: Optional different reply address

### Role-Based Access

Identities are controlled by roles. Only users with matching roles can send from that identity:

| Identity | Allowed Roles |
|----------|---------------|
| `president@sbnewcomers.org` | president, admin |
| `vp@sbnewcomers.org` | vp-activities, admin |
| `webmaster@sbnewcomers.org` | webmaster, admin |
| `info@sbnewcomers.org` | president, vp-activities, webmaster, admin |

Admin role can always use any identity.

### API Endpoints

| Endpoint | Method | Description | Capability Required |
|----------|--------|-------------|---------------------|
| `/api/v1/admin/comms/identities` | GET | List all identities | comms:manage |
| `/api/v1/admin/comms/identities` | POST | Create identity | admin:full |
| `/api/v1/admin/comms/identities/:id` | GET | Get identity | comms:manage |
| `/api/v1/admin/comms/identities/:id` | PUT | Update identity | admin:full |
| `/api/v1/admin/comms/identities/:id` | DELETE | Deactivate identity | admin:full |

## Message Templates

### Template Variables

Templates support variable substitution using `{{category.field}}` syntax:

**Member Variables**
- `{{member.firstName}}` - Member first name
- `{{member.lastName}}` - Member last name
- `{{member.fullName}}` - Full name
- `{{member.email}}` - Email address
- `{{member.phone}}` - Phone number

**Event Variables**
- `{{event.title}}` - Event title
- `{{event.description}}` - Event description
- `{{event.location}}` - Event location
- `{{event.startDate}}` - Start date (formatted)
- `{{event.startTime}}` - Start time (formatted)
- `{{event.endDate}}` - End date
- `{{event.endTime}}` - End time
- `{{event.category}}` - Event category

**Club Variables**
- `{{club.name}}` - Club name
- `{{club.website}}` - Club website URL
- `{{club.email}}` - Club contact email

**System Variables**
- `{{currentYear}}` - Current year
- `{{currentDate}}` - Current date

### Template Safety

All variable values are HTML-escaped to prevent XSS attacks. Missing values render as empty strings.

### API Endpoints

| Endpoint | Method | Description | Capability Required |
|----------|--------|-------------|---------------------|
| `/api/v1/admin/comms/templates` | GET | List templates | comms:manage |
| `/api/v1/admin/comms/templates` | POST | Create template | comms:manage |
| `/api/v1/admin/comms/templates/:id` | GET | Get template | comms:manage |
| `/api/v1/admin/comms/templates/:id` | PUT | Update template | comms:manage |
| `/api/v1/admin/comms/templates/:id` | DELETE | Deactivate template | comms:manage |
| `/api/v1/admin/comms/templates/:id/preview` | POST | Preview with sample data | comms:manage |
| `/api/v1/admin/comms/templates/:id/test-send` | POST | Send test email | comms:send |
| `/api/v1/admin/comms/templates/tokens` | GET | List available tokens | comms:manage |

## Email Composer

### Compose Flow

1. Select from-address identity (role-restricted)
2. Choose template or write custom content
3. Add recipients (manual or from saved lists)
4. Preview the email
5. Send immediately, schedule, or save as draft

### API Endpoint

| Endpoint | Method | Description | Capability Required |
|----------|--------|-------------|---------------------|
| `/api/v1/admin/comms/compose` | POST | Compose and send | comms:send |

### Compose Request Body

```json
{
  "identityId": "uuid",
  "templateId": "uuid (optional)",
  "subject": "string (required if no template)",
  "bodyHtml": "string (required if no template)",
  "recipients": [
    { "email": "user@example.com", "name": "John Doe", "memberId": "uuid (optional)" }
  ],
  "scheduledFor": "ISO date string (optional)",
  "sendImmediately": true,
  "idempotencyKey": "client-key (optional)"
}
```

## Email Outbox

### Status Lifecycle

```
DRAFT → QUEUED → SENDING → SENT → DELIVERED
                    │          │
                    │          └→ BOUNCED
                    └→ FAILED
```

| Status | Description |
|--------|-------------|
| DRAFT | Composed but not queued |
| QUEUED | Ready to send |
| SENDING | Currently being processed |
| SENT | Delivered to SMTP |
| DELIVERED | Delivery confirmed |
| BOUNCED | Permanent delivery failure |
| FAILED | Send failed (SMTP error) |

### API Endpoint

| Endpoint | Method | Description | Capability Required |
|----------|--------|-------------|---------------------|
| `/api/v1/admin/comms/outbox` | GET | List outbox items | comms:manage |

## UI Pages

| Path | Description |
|------|-------------|
| `/admin/comms/identities` | Manage email identities |
| `/admin/comms/templates` | Manage message templates |
| `/admin/comms/compose` | Compose and send emails |

## Permissions

### Capabilities

- **comms:manage** - Create/edit templates, view identities, view outbox
- **comms:send** - Send emails (test send, compose)
- **admin:full** - Create/edit identities, full access

### Role Mapping

| Role | comms:manage | comms:send |
|------|--------------|------------|
| admin | ✓ | ✓ |
| president | ✗ | ✗ |
| webmaster | ✓ | ✗ |

Note: Webmaster can manage templates but cannot send without additional capability.

## Security Considerations

### Charter Compliance

- **P1 (Provable Identity)**: All sends are attributed to authenticated users
- **P2 (Default Deny)**: Role-based identity access, capability checks on all endpoints
- **P3 (State Machine)**: Email lifecycle uses explicit OutboxStatus enum
- **P4 (No Hidden Rules)**: Token documentation available via API
- **P5 (Reversible)**: Soft delete for identities and templates
- **N5 (Idempotent)**: Idempotency keys prevent duplicate sends
- **N7 (PII)**: Minimal member data in templates, no unnecessary exposure
- **N8 (Template Safety)**: HTML escaping, preview before send

### Audit Trail

All significant actions are logged to AuditLog:
- Identity create/update/delete
- Template create/update/delete
- Test sends
- Compose sends

## Testing

### Test Send

Use the test-send endpoint to verify templates before sending to real recipients:

```bash
curl -X POST /api/v1/admin/comms/templates/:id/test-send \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "identityId": "uuid"}'
```

### E2E Tests

```bash
# Run comms-specific tests
npm run test-admin -- --grep comms
```

## Configuration

### Environment Variables

```env
# SMTP Configuration (future)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=password

# Default uses stub provider in development
```

### Database Migration

```bash
npx prisma migrate dev --name add-email-identity-outbox
```
