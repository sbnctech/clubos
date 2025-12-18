# ClubOS Demo Guide

This guide describes how to run a live demonstration of ClubOS features.

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Seed demo users (first time only):**
   ```bash
   npx prisma db seed
   ```

3. **Open the Demo Dashboard:**
   Navigate to http://localhost:3000/admin/demo

4. **Reset demo data (optional):**
   ```bash
   npx ts-node scripts/demo/reset-demo-data.ts
   ```

## Demo User Accounts

The seed script creates demo users for each role. Use these accounts to demonstrate role-specific features.

| Role | Email | Capabilities |
|------|-------|--------------|
| President | president@demo.clubos.test | Full admin access |
| Secretary | secretary@demo.clubos.test | Minutes management, member records |
| Parliamentarian | parliamentarian@demo.clubos.test | Governance rules, procedures |
| Event Chair | eventchair@demo.clubos.test | Event management |
| Member | member@demo.clubos.test | Basic member access only |

### Logging In as a Demo User

1. Navigate to http://localhost:3000/login
2. Enter the demo user's email address
3. Click "Send sign-in link"
4. In development mode, the magic link URL is logged to the console
5. Click the link or paste it in your browser to authenticate

**Tip:** Keep a terminal visible during demos to quickly grab magic link URLs.

### Role Capabilities by Account

- **President**: Can access all admin features including members, events, registrations, transitions, content, and communications
- **Secretary**: Can draft and edit meeting minutes, view board records
- **Parliamentarian**: Can manage governance rules, view board records
- **Event Chair**: Can manage events and view registrations
- **Member**: Can view their own profile and register for events

## Demo Dashboard Overview

The Demo Dashboard (`/admin/demo`) provides:

- **System Status Panel** - Shows database connectivity, email configuration, and environment info
- **Work Queue** - Lists items to demonstrate:
  - Upcoming events (next 30 days)
  - Recent registrations (last 7 days)
  - Pending governance items

## Demo Walkthrough

### 1. System Health Check

Start by showing the System Status panel:

- Database connection status and latency
- Email provider configuration
- Environment (development/production)
- Passkey authentication status

### 2. Event Management Demo

From the work queue, click on an upcoming event to demonstrate:

- Event details view
- Registration list
- Capacity management
- Publishing workflow

### 3. Registration Flow Demo

Show the member registration experience:

- Browse events as a member
- Register for an event
- View confirmation
- Check waitlist behavior (if event is full)

### 4. Governance Features Demo

If governance items appear in the work queue:

- Review flags workflow
- Minutes approval process
- Motion tracking

### 5. Authentication Demo

Demonstrate the authentication flows:

**Magic Link Login:**
1. Go to /login
2. Enter a demo user's email (e.g., president@demo.clubos.test)
3. Click "Send sign-in link"
4. Show the magic link URL in the console
5. Click the link to authenticate

**Passkey Registration:**
1. Log in using magic link first
2. Go to /account/security
3. Click "Add Passkey"
4. Complete Touch ID / Face ID / security key prompt
5. Name the device

**Passkey Login:**
1. Log out first
2. Go to /login
3. Click "Sign in with Passkey"
4. Complete Touch ID / Face ID / security key prompt
5. Instantly authenticated

**Account Indicator:**
- Show the account menu in the header (name, email, role badge)
- Demonstrate logout functionality

**Authorization UI:**
- Log in as Member to show limited navigation
- Log in as President to show full admin navigation
- Show the Access Denied page by accessing a restricted URL directly

## API Endpoints

The demo system uses these API endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/admin/demo/status` | System health indicators |
| `GET /api/admin/demo/work-queue` | Demo work queue items |

Both endpoints require `admin:full` capability.

## Demo Reset

To reset demo data for a fresh demonstration:

```bash
npx ts-node scripts/demo/reset-demo-data.ts
```

This script:

- Clears recent event registrations (last 7 days)
- Removes expired auth challenges
- Preserves members, events, and governance records

**Safety:** The script refuses to run in production unless `FORCE_DEMO_RESET=true` is set.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PASSKEY_RP_ID` | WebAuthn relying party ID | Production |
| `PASSKEY_ORIGIN` | Expected origin for WebAuthn | Production |
| `RESEND_API_KEY` | Email provider API key | Optional |

## Troubleshooting

### "Unable to fetch system status"

- Check database connection
- Verify `DATABASE_URL` is set correctly
- Ensure the database is running

### "Unable to fetch work queue"

- Verify admin authentication
- Check that `admin:full` capability is granted
- Look for errors in server logs

### No items in work queue

- Seed the database with demo data
- Create sample events and registrations
- Add governance records if demonstrating those features
