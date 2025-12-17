# ClubOS Data Migration Pipeline

Wild Apricot (WA) → ClubOS data migration tool.

## Overview

This pipeline enables repeatable, safe migration of SBNC membership data from Wild Apricot to ClubOS. It supports:

- **Dry-run mode**: Preview all changes without modifying the database
- **Idempotent imports**: Safe to re-run; existing records are matched and updated
- **Detailed reporting**: JSON reports with full audit trail
- **Configurable mapping**: YAML config for field mapping and transformations

## Quick Start

```bash
# 1. Run dry-run with sample data
npx ts-node scripts/migration/migrate.ts --dry-run

# 2. Review the report in scripts/migration/reports/

# 3. Run dry-run with real WA exports
npx ts-node scripts/migration/migrate.ts --dry-run --data-dir ./wa-export

# 4. If satisfied, run live import
npx ts-node scripts/migration/migrate.ts --live --data-dir ./wa-export --yes
```

## Directory Structure

```
scripts/migration/
├── migrate.ts              # Main CLI entry point
├── reset-sandbox.ts        # Reset tool for testing
├── README.md               # This file
├── config/
│   └── migration-config.yaml   # Field mappings and rules
├── lib/
│   ├── types.ts            # TypeScript type definitions
│   ├── config.ts           # Config loader
│   ├── csv-parser.ts       # CSV parsing and field mapping
│   └── migration-engine.ts # Core migration logic
├── sample-pack/            # Example data for testing
│   ├── members/
│   │   └── wa-members-export.csv
│   └── events/
│       ├── wa-events-export.csv
│       └── wa-registrations-export.csv
└── reports/                # Generated reports (gitignored)
```

## Required WA Exports

### 1. Members Export

From Wild Apricot: **Contacts → All Contacts → Export → CSV**

Required columns:
| Column | Description |
|--------|-------------|
| Contact ID | WA unique identifier |
| First name | Member first name |
| Last name | Member last name |
| Email | Primary email (must be unique) |
| Phone | Phone number (optional) |
| Member since | Join date (MM/DD/YYYY) |
| Membership level | WA level name |

### 2. Events Export

From Wild Apricot: **Events → Export All Events**

Required columns:
| Column | Description |
|--------|-------------|
| Event ID | WA event identifier |
| Event name | Event title |
| Description | Event description |
| Tags | Category/tags |
| Location | Event location |
| Start date | Start date/time |
| End date | End date/time |
| Registration limit | Capacity (optional) |

### 3. Registrations Export

From Wild Apricot: **Events → [Event] → Registrations → Export** or bulk export

Required columns:
| Column | Description |
|--------|-------------|
| Registration ID | WA registration identifier |
| Contact ID | Links to member |
| Event ID | Links to event |
| Registration status | Status (Confirmed, Cancelled, etc.) |
| Registration date | When registered |
| Cancellation date | If cancelled (optional) |

## Configuration

Edit `config/migration-config.yaml` to customize:

### Membership Status Mapping

```yaml
membership_status_mapping:
  "New Member": "NEWCOMER"
  "Newcomer": "NEWCOMER"
  "1st Year": "NEWCOMER"
  "2nd Year": "NEWCOMER"
  "Third Year": "EXTENDED"
  "Alumni": "ALUMNI"
  "Lapsed": "LAPSED"
  _default: "PROSPECT"
```

### Field Mapping

```yaml
member_fields:
  firstName: "First name"      # Direct mapping
  lastName: "Last name"
  email: "Email"
  membershipStatusId:          # Transform mapping
    source: "Membership level"
    transform: "membership_status_lookup"
```

### ID Reconciliation Rules

```yaml
id_reconciliation:
  members:
    primary_key: "email"       # Match by email (unique)
    on_conflict: "update"      # Update existing records
  events:
    composite_key: ["title", "startTime"]
    time_tolerance_minutes: 60
    on_conflict: "skip"        # Don't update existing events
```

## CLI Reference

### migrate.ts

```bash
npx ts-node scripts/migration/migrate.ts [OPTIONS]

Options:
  --dry-run           Preview changes without database writes (default)
  --live              Actually write to database
  --yes, -y           Confirm live mode (required for --live)

  --data-dir, -d      Directory with CSV files
  --members           Members CSV filename
  --events            Events CSV filename
  --registrations     Registrations CSV filename

  --config, -c        Custom config YAML path
  --output, -o        Report output directory

  --verbose, -v       Show detailed output (default)
  --quiet, -q         Minimal output
```

### reset-sandbox.ts

```bash
npx ts-node scripts/migration/reset-sandbox.ts [OPTIONS]

Options:
  --dry-run           Show what would be deleted (default)
  --confirm "I understand this deletes data"
                      Actually delete data

  --reset-all         Also reset reference data
  --reset-statuses    Reset membership statuses
  --reset-committees  Reset committees and roles
  --reset-terms       Reset terms
```

## Migration Workflow

### Initial Migration

1. **Export from Wild Apricot**
   - Export contacts (all members)
   - Export all events
   - Export registrations (may need per-event exports)

2. **Prepare data directory**
   ```bash
   mkdir -p wa-export
   cp ~/Downloads/contacts.csv wa-export/wa-members-export.csv
   cp ~/Downloads/events.csv wa-export/wa-events-export.csv
   cp ~/Downloads/registrations.csv wa-export/wa-registrations-export.csv
   ```

3. **Dry run**
   ```bash
   npx ts-node scripts/migration/migrate.ts \
     --dry-run \
     --data-dir ./wa-export
   ```

4. **Review report**
   - Check `scripts/migration/reports/migration-report-dry-run-*.json`
   - Verify counts and any errors

5. **Live import**
   ```bash
   npx ts-node scripts/migration/migrate.ts \
     --live \
     --data-dir ./wa-export \
     --yes
   ```

### Re-running Migrations

The pipeline is idempotent:

- **Members**: Matched by email. Existing members are updated, new ones created.
- **Events**: Matched by title + start time (±1 hour). Existing events are skipped.
- **Registrations**: Matched by member + event. Existing registrations are updated.

To fully reset and re-import:

```bash
# Reset sandbox (CAREFUL!)
npx ts-node scripts/migration/reset-sandbox.ts --confirm "I understand this deletes data"

# Re-run migration
npx ts-node scripts/migration/migrate.ts --live --data-dir ./wa-export --yes
```

## Reports

Each run generates two report files:

1. **Summary report** (`migration-report-*.json`)
   - High-level counts
   - Errors and warnings
   - ID mappings

2. **Full report** (`migration-report-*-full.json`)
   - All individual records
   - Per-record actions and errors

### Sample Report Structure

```json
{
  "runId": "abc123...",
  "startedAt": "2024-01-15T10:00:00Z",
  "completedAt": "2024-01-15T10:00:05Z",
  "dryRun": false,
  "summary": {
    "totalRecords": 40,
    "created": 35,
    "updated": 3,
    "skipped": 0,
    "errors": 2,
    "duration_ms": 5432
  },
  "members": {
    "totalRows": 10,
    "created": 8,
    "updated": 2,
    "errors": 0
  },
  "idMapping": {
    "members": [
      { "waId": "WA001", "clubosId": "uuid...", "email": "alice@example.com" }
    ]
  }
}
```

## Troubleshooting

### "Could not resolve member ID"

Registration import failed because the referenced member wasn't imported. Ensure members are imported before registrations.

### "Unknown membership status"

The WA membership level doesn't have a mapping in `migration-config.yaml`. Add it to `membership_status_mapping`.

### Duplicate email errors

Two WA contacts have the same email. ClubOS requires unique emails. Resolve in WA before export, or manually edit the CSV.

### Date parsing errors

WA dates must be in MM/DD/YYYY or MM/DD/YYYY HH:mm format. Check for malformed dates in your export.

## Safety Features

1. **Dry-run default**: Must explicitly use `--live` to modify data
2. **Confirmation required**: Live mode requires `--yes` flag
3. **Production guard**: Reset tool refuses to run on production databases
4. **Idempotent**: Safe to re-run without duplicating data
5. **Detailed logging**: Full audit trail in reports
6. **Continue on error**: Single record failures don't stop the batch

## Extending

### Adding New Field Mappings

1. Add field to config YAML
2. Update parser in `csv-parser.ts` if transform needed
3. Update engine in `migration-engine.ts` to handle new field

### Adding New Entity Types

1. Add types to `types.ts`
2. Add mapping function to `csv-parser.ts`
3. Add processing method to `migration-engine.ts`
4. Update CLI to accept new file type
