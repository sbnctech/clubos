# Production Migration Runbook

This document provides operator guidance for production Wild Apricot migrations.

**Related**: Issue #202 (WA Migration), Epic #277 (Rollback & Recovery)

---

## Table of Contents

1. [Pre-Migration Preparation](#1-pre-migration-preparation)
2. [Migration Execution](#2-migration-execution)
3. [Post-Migration Verification](#3-post-migration-verification)
4. [Rollback Procedures](#4-rollback-procedures)
5. [Escalation Paths](#5-escalation-paths)

---

## 1. Pre-Migration Preparation

### 1.1 Checklist

Before running a production migration:

- [ ] Backup created and verified (see [MIGRATION_ROLLBACK_RECOVERY.md](./MIGRATION_ROLLBACK_RECOVERY.md))
- [ ] Dry run completed and reviewed
- [ ] Policy bundle validated
- [ ] Stakeholders notified
- [ ] Maintenance window scheduled (if applicable)

### 1.2 Environment Verification

```bash
# Verify environment
echo "Database: $DATABASE_URL" | grep -o 'localhost\|prod\|staging'

# Verify WA connectivity
npx tsx scripts/importing/wa_health_check.ts
```

---

## 2. Migration Execution

See [IMPORTER_RUNBOOK.md](./IMPORTER_RUNBOOK.md) for detailed execution commands.

### 2.1 Recommended Flow

1. Run dry run first
2. Review dry run output
3. Create database backup
4. Execute migration
5. Run verification immediately

---

## 3. Post-Migration Verification

### 3.1 When to Run Verification

Run verification:

- **Immediately after every production migration**
- After any migration that writes to the database (not dry runs)
- When troubleshooting migration issues
- Before notifying stakeholders that migration is complete

### 3.2 Running the Verification Tool

```bash
# Basic verification
npx tsx scripts/migration/verify-migration.ts \
  --bundle ./migration-bundle-2024-01-15 \
  --output ./verification-report.md

# JSON output for automation
npx tsx scripts/migration/verify-migration.ts \
  --bundle ./migration-bundle-2024-01-15 \
  --format json \
  --output ./verification-report.json

# Verbose mode
npx tsx scripts/migration/verify-migration.ts \
  --bundle ./migration-bundle-2024-01-15 \
  --verbose
```

### 3.3 What Success Looks Like

A successful verification produces:

```
============================================================
  Post-Migration Verification
  Started: 2024-01-15T14:30:00.000Z
  Bundle: ./migration-bundle-2024-01-15
============================================================

[1/4] Loading migration bundle...
  - Run ID: run-20240115-143000
  - Dry run: false
  - Completed: 2024-01-15T14:28:00.000Z

[2/4] Connecting to database...
  - Members: 2147
  - Events: 523
  - Registrations: 8603

[3/4] Running verification checks...
  [PASS] Member Count: Member count matches: 2147
  [PASS] Event Count: Event count matches: 523
  [PASS] Registration Count: Registration count matches: 8603
  [PASS] Tier Distribution: Tier distribution: NEWCOMER: 500, FIRST_YEAR: 800...
  [PASS] Tier Coverage: Tier coverage: 98.5% (2115/2147)
  [PASS] Orphaned Registrations: No orphaned registrations found
  [PASS] Duplicate ID Mappings: No duplicate ID mappings found
  [PASS] Run ID Match: Run ID matches: run-20240115-143000

[4/4] Generating verification report...
  - Report written to: ./verification-report.md

============================================================
  Verification PASSED
  Checks: 8 passed, 0 failed, 0 warnings
  Duration: 1523ms
============================================================
```

**Exit code 0** indicates all checks passed.

### 3.4 What Failures Mean

| Check | Failure Meaning | Action |
|-------|-----------------|--------|
| Member Count | Members missing or extra | Compare bundle vs DB, check for errors |
| Event Count | Events missing or extra | Review event import logs |
| Registration Count | Registrations lost | Check member/event mappings |
| Tier Distribution | All in one tier | Verify tier mapping config |
| Tier Coverage | Many null tiers | Check tier seeding, mapping |
| Orphaned Registrations | Data integrity issue | Review foreign key relationships |
| Duplicate Mappings | ID collision | Check for re-runs without cleanup |
| Run ID Match | Different migration | Verify correct bundle used |

### 3.5 Interpreting the Report

The verification report contains:

| Section | Purpose |
|---------|---------|
| Summary | Pass/fail counts at a glance |
| Count Comparison | Bundle vs database record counts |
| Tier Distribution | How members are distributed across tiers |
| Verification Checks | Detailed pass/fail for each check |
| Policy Verification | Whether policies match expectations |

### 3.6 Common Verification Issues

#### Issue: Count Mismatch

```
[FAIL] Member Count: Member count mismatch: expected 2147, got 2100 (diff: 47)
```

**Diagnosis**:
1. Check migration error logs for skipped records
2. Verify required fields were present in source data
3. Check for duplicate email addresses (unique constraint)

**Resolution**:
- Review skipped records in migration report
- Re-run with corrected source data if needed

#### Issue: Low Tier Coverage

```
[WARN] Tier Coverage: Low tier coverage: 85.0% - 322 members without tier
```

**Diagnosis**:
1. Check if tier seeding was run
2. Verify tier mapping configuration
3. Check source data for unmapped membership levels

**Resolution**:
- Run tier seeder if tiers are missing
- Update tier mapping config
- Re-run migration to update tier assignments

#### Issue: All Members in One Tier

```
[WARN] Tier Distribution: Warning: All members in tier 'GENERAL' - verify mapping
```

**Diagnosis**:
1. Check tier mapping configuration
2. Verify source data has membership level information
3. Check for _default fallback being used

**Resolution**:
- Update tier mapping to include all source levels
- Verify source data quality

### 3.7 When to Escalate

Escalate to merge captain if:

- Verification fails with data integrity issues (orphaned registrations)
- Count mismatch exceeds 5% of total records
- Multiple verification failures occur
- Rollback is required

Do NOT self-remediate integrity failures. Document and escalate.

---

## 4. Rollback Procedures

See [MIGRATION_ROLLBACK_RECOVERY.md](./MIGRATION_ROLLBACK_RECOVERY.md) for detailed rollback procedures.

### 4.1 Quick Reference

| Situation | Action |
|-----------|--------|
| Verification fails, minor issues | Fix source data, re-run |
| Verification fails, major issues | Level 1 rollback (by run_id) |
| Database corruption | Level 2 rollback (restore backup) |

---

## 5. Escalation Paths

| Issue | Contact | Priority |
|-------|---------|----------|
| Verification failure | Merge captain | High |
| Database corruption | DBA + Merge captain | Critical |
| Data loss | Incident response | Critical |

---

## Appendix: Verification Tool Reference

### Command Line Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--bundle` | `-b` | Path to migration bundle (required) | - |
| `--output` | `-o` | Output report path | `./verification-report.md` |
| `--format` | `-f` | Output format: markdown, json | `markdown` |
| `--verbose` | `-v` | Verbose output | `false` |
| `--help` | `-h` | Show help | - |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | One or more checks failed |
| 2 | Error (bundle not found, DB error) |

### Required Bundle Structure

The verification tool expects:

```
migration-bundle/
├── migration-report.json    # Required
├── policy-bundle.json       # Optional
└── migration-config.json    # Optional
```

---

_Document maintained as part of Epic #202 (WA Migration)_
