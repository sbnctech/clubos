# Membership Tier Mapping

This document describes how Wild Apricot (WA) membership levels are mapped to ClubOS `MembershipTier` records during import.

## Overview

ClubOS maintains a canonical `MembershipTier` model that represents membership progression levels. During WA import, contacts' membership levels are resolved to the appropriate ClubOS tier using a best-effort mapping strategy.

## Canonical Membership Tiers

The following tiers are seeded into ClubOS:

| Code            | Name            | Sort Order | Description                                      |
|-----------------|-----------------|------------|--------------------------------------------------|
| `unknown`       | Unknown         | 0          | Fallback for unmapped or missing WA levels       |
| `extended_member` | Extended Member | 10         | Extended newcomer period (6-24 months)           |
| `newbie_member` | Newbie Member   | 20         | Initial newcomer period (0-6 months)             |
| `member`        | Member          | 30         | Full member status                               |

## WA Level to ClubOS Tier Mapping

The following Wild Apricot membership level names map to ClubOS tiers:

| WA Level Name       | ClubOS Tier Code   | Notes                                |
|---------------------|--------------------|--------------------------------------|
| `ExtendedNewcomer`  | `extended_member`  | Exact string match                   |
| `NewbieNewcomer`    | `newbie_member`    | Exact string match                   |
| `NewcomerMember`    | `member`           | Exact string match                   |
| `Admins`            | `unknown`          | Known non-tier (role, not membership)|
| (any other value)   | `unknown`          | Unmapped value preserved in rawValue |
| (null/missing)      | `unknown`          | Missing level data                   |

## Resolution Logic

The `resolveMembershipTier()` function in `src/lib/importing/wildapricot/transformers.ts` implements the mapping:

1. **Missing Level**: If `MembershipLevel` is null or has no Name, returns `unknown` with confidence `"missing"`

2. **Known Non-Tier**: If level name matches a known non-tier (e.g., "Admins"), returns `unknown` with confidence `"unmapped"`

3. **Exact Match**: If level name matches one of the known WA levels, returns the corresponding tier code with confidence `"exact"`

4. **Unknown Level**: Any unrecognized level name returns `unknown` with confidence `"unmapped"`

### Resolution Result Structure

```typescript
interface MembershipTierResolution {
  tierCode: string;          // ClubOS tier code
  rawValue: string | null;   // Original WA value for traceability
  confidence: "exact" | "unmapped" | "missing";
}
```

## Data Flow During Import

1. **Preflight Check**: The importer verifies all required tier codes exist in the database before starting

2. **Tier Resolution**: For each WA contact, `resolveMembershipTier()` determines the appropriate tier

3. **Warning Logging**: Non-exact mappings log warnings with:
   - WA contact ID and email
   - Raw WA value
   - Confidence level

4. **Member Update**: The member record is updated with:
   - `membershipTierId`: Link to the resolved `MembershipTier`
   - `waMembershipLevelRaw`: Original WA value for audit trail

## Database Schema

### MembershipTier Model

```prisma
model MembershipTier {
  id        String   @id @default(uuid()) @db.Uuid
  code      String   @unique
  name      String
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  members   Member[]
}
```

### Member Model (relevant fields)

```prisma
model Member {
  // ... other fields
  membershipTierId      String?  @db.Uuid
  waMembershipLevelRaw  String?
  membershipTier        MembershipTier? @relation(...)
}
```

## Seeding

Run the seeder script to initialize membership tiers:

```bash
# Dry run (safe, no changes)
DRY_RUN=1 npx tsx scripts/importing/seed_membership_tiers.ts

# Production seeding (requires explicit opt-in)
ALLOW_PROD_SEED=1 npx tsx scripts/importing/seed_membership_tiers.ts
```

The seeder is idempotent and uses upsert operations.

## Admin Status Endpoint

The `/api/v1/admin/import/status` endpoint reports:

- **membershipTierCounts**: Array of `{ code, name, count }` showing member distribution by tier
- **membersMissingTierCount**: Number of members with no tier assigned

Example response:

```json
{
  "membershipTierCounts": [
    { "code": "unknown", "name": "Unknown", "count": 5 },
    { "code": "extended_member", "name": "Extended Member", "count": 42 },
    { "code": "newbie_member", "name": "Newbie Member", "count": 28 },
    { "code": "member", "name": "Member", "count": 156 }
  ],
  "membersMissingTierCount": 3
}
```

## Troubleshooting

### Members assigned to "Unknown" tier

Check the import logs for warning messages containing:
- "Non-exact tier mapping" - indicates an unmapped WA level
- Review `waMembershipLevelRaw` field on affected members

### New WA membership levels

If SBNC adds new membership levels in Wild Apricot:

1. Add the mapping to `WA_LEVEL_TO_TIER_CODE` in `transformers.ts`
2. Optionally create a new tier in `seed_membership_tiers.ts`
3. Re-run the seeder if adding a new tier
4. Re-import affected members

### Preflight failures

If preflight reports missing tiers:

1. Run the seeder script
2. Verify database connectivity
3. Check for migration issues

## Related Documentation

- [WA Field Mapping](./WA_FIELD_MAPPING.md) - Full field mapping specification
- [Importer System Spec](./IMPORTER_SYSTEM_SPEC.md) - Import system architecture
- [Importer Runbook](./IMPORTER_RUNBOOK.md) - Operational procedures
