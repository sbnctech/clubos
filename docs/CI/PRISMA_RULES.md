# Prisma CI Gate Rules

This document describes how CI validates Prisma schema changes and why certain
configuration choices exist. See also: `.github/workflows/ci-prisma-build.yml`.

## Purpose

Prevent broken builds caused by code referencing Prisma models, fields, or enums
that do not exist in `prisma/schema.prisma`. This is a common source of CI
failures and deployment blockers.

## The Rule: Schema-First

**Any Prisma model, field, or enum used in code must exist in `schema.prisma`
before the code referencing it is merged.**

This means:
- Add the model/field/enum to `schema.prisma` first
- Create and commit the migration under `prisma/migrations/`
- Then write or update the TypeScript code that uses it

Violating this order causes `prisma generate` to succeed but `tsc` to fail
because the generated client lacks the expected types.

## What Triggers the Full Pipeline

The workflow runs the full Prisma/build pipeline when either:

1. **Schema changed**: Any modification to:
   - `prisma/schema.prisma`
   - `prisma/migrations/**`
   - `package.json` or `package-lock.json`

2. **Prisma usage detected in changed code**: Source files (`.ts`, `.tsx`) that
   import or reference Prisma patterns:
   - `@prisma/client`
   - `new PrismaClient`
   - `Prisma.` or `prisma.`
   - `@/lib/prisma` or `from "@/lib/prisma"`

If neither condition is met, the build is skipped with a clear message.

## Why DATABASE_URL Must Be Job-Level

The `DATABASE_URL` environment variable must be set at the **job level**, not
just individual steps. Here is why:

```yaml
prisma_build:
  runs-on: ubuntu-latest
  env:
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db?schema=public"
```

The reason: `npm ci` runs `postinstall` hooks, which includes `prisma generate`.
If `DATABASE_URL` is only set in later steps, `npm ci` fails because Prisma
cannot parse its schema without a valid connection string format.

The URL does not need to point to a real database for `prisma generate` and
`prisma validate`; it only needs valid syntax.

## Fail-Open Principle

If the workflow cannot determine whether Prisma changes are present (e.g., the
git diff fails or the base ref cannot be resolved), it **fails open** by running
the full build pipeline. This ensures:

- New branches always get validated
- Force-pushes do not skip validation
- Edge cases default to safety, not silence

The cost is occasional unnecessary builds; the benefit is no silent breakage.

## Common Failure Modes and Quick Fixes

### 1. "Property 'X' does not exist on type 'PrismaClient'"

**Cause**: Code references a model/field/enum not in `schema.prisma`.

**Fix**:
1. Add the missing model/field/enum to `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_X` (or appropriate migration)
3. Commit both schema and migration files

### 2. "npm ci failed" with Prisma errors

**Cause**: `DATABASE_URL` not set when `npm ci` runs `postinstall`.

**Fix**: Ensure `DATABASE_URL` is set at job level, not step level.

### 3. Build skipped but should have run

**Cause**: Changed file does not match detection patterns.

**Fix**: The workflow uses conservative patterns. If you add a new import path
for Prisma, update the `PRISMA_PATTERNS` variable in the workflow.

### 4. Migration out of sync

**Cause**: Schema was modified but migration was not created.

**Fix**:
1. Run `npx prisma migrate dev --name describe_change`
2. Commit the generated migration directory

## Related Files

- `.github/workflows/ci-prisma-build.yml` - The CI workflow
- `.github/pull_request_template.md` - PR checklist (includes Prisma section)
- `prisma/schema.prisma` - The source of truth for data models
- `docs/ARCHITECTURAL_CHARTER.md` - Overall system principles (P1: Schema-first)
