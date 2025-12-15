Prisma Dev DB Reset and Drift SOP

Scope:
- LOCAL DEV ONLY (clubos_dev on localhost:5432)
- Never run against production.

When to use:
- Prisma reports drift or "migration(s) applied to the database but missing locally"
- You switched branches and seed/migrations disagree

Safe procedure:
1) Confirm target is localhost and database is clubos_dev
2) Reset dev DB
3) Apply migrations
4) Generate client
5) Seed (if needed)
6) Re-run failing test(s)

Commands:
- scripts/ops/db/check_drift.sh
- scripts/ops/db/reset_dev_db.sh

Notes:
- If drift appears after switching branches, your dev DB likely contains migrations from another branch.
- Always reset LOCAL dev DB before creating new migrations.
