# Lifecycle Deep Links Demo Script

**Duration:** 5-7 minutes
**Purpose:** Demonstrate the membership lifecycle state machine with real member examples

## Prerequisites

- Database has been seeded with members (via WA sync or seed script)
- Dev server running at `localhost:3000`
- Access to `/admin/demo` dashboard

## Demo Flow

### 1. Open the Demo Dashboard (1 min)

Navigate to `/admin/demo` to see the Demo Dashboard.

**Talking points:**

- This is a demo-focused view showing system health and work queues
- Notice the "Lifecycle Demo Scenarios" panel with interactive cards
- Shows coverage: how many lifecycle states have real member examples

### 2. Review Lifecycle Scenarios (2 min)

The **Lifecycle Demo Scenarios** panel shows cards for each membership lifecycle state:

| State | Description |
|-------|-------------|
| **Active Newbie** | New member within 90-day orientation period |
| **Active Member** | Standard member past newbie period |
| **Active Extended** | Third-year member with extended privileges |
| **Lapsed** | Membership ended, no active privileges |
| **Pending New** | Application submitted, awaiting approval |
| **Suspended** | Temporarily suspended membership |
| **Unknown** | Data quality issue requiring admin review |

**Talking points:**

- Each card shows the actual member found for that scenario
- Color-coded badges indicate the lifecycle state
- Cards show member name, status, tier, and days since joining
- Missing scenarios indicate gaps in demo data (run seed to populate)

### 3. Deep Link to Member Detail (2 min)

Click "View Member" on any scenario card to jump directly to that member's detail page.

**Talking points:**

- Direct navigation to the member's admin profile
- The **Lifecycle Explainer Panel** shows exactly how the state was determined
- Explains the inference reason: which fields contributed to the state
- Shows milestone tracking: newbie period, two-year mark

### 4. Explore the Lifecycle Explainer (2 min)

On the member detail page, focus on the Lifecycle Explainer Panel:

**Key sections:**

- **Current State** - The computed lifecycle state with description
- **Inference Reason** - Why this state was determined
- **Relevant Data** - The actual field values used
- **Milestones** - Key dates (newbie end, two-year mark)
- **Next Transitions** - What state changes are possible

**Talking points:**

- No hidden rules - everything is transparent
- State machine is deterministic based on:
  - Membership status (active, lapsed, pending, suspended)
  - Membership tier (newbie, member, extended)
  - Join date and tenure
- Same logic runs everywhere (APIs, admin UI, reports)

## Alternative: Table View

Below the scenario cards is a table view showing the same data in a different format:

- Useful for comparing multiple members side-by-side
- Shows status/tier badges with color coding
- Days since join for quick tenure comparison

## API Endpoints

For developers, these APIs power the demo:

- `GET /api/admin/demo/scenarios` - Returns scenarios with matching members
- `GET /api/v1/admin/members/{id}/lifecycle` - Full lifecycle data for a member
- `GET /api/admin/demo/member-list` - Paginated member list with lifecycle hints

## Troubleshooting

**"No matching member found" for all scenarios:**

Run the seed script to create demo members:

```bash
npx tsx scripts/importing/seed_demo_members.ts
```

Or run a full WA sync:

```bash
npx tsx scripts/sync_members.ts
```

**Lifecycle state mismatch:**

The scenarios API verifies that the found member actually produces the expected state. If there's a mismatch, the actual inferred state is shown. This can happen if:

- Member data changed since the last sync
- Seed data is stale relative to date calculations

---

*Last updated: December 2024*
