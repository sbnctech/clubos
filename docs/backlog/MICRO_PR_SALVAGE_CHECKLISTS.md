# Micro-PR salvage checklists (post editor-wave)

Rules
- Micro-PR target: < 300 net LOC, one feature, one test set.
- Avoid hotspots unless it is a themed wave owned by merge captain.
- Hotspots: prisma/schema.prisma, package.json/package-lock.json, core admin surfaces, shared layout/nav.

PR #136
- Intended outcome:
  - Clarify blocks vs sections terminology and document the deprecation/migration plan (rename stripes -> sections) without runtime changes.
- Smallest slice:
  - Docs-only: introduce/refresh canonical explanation and a short plan doc.
- Files likely touched (confirm non-hotspot):
  - KEEP (docs-only):
    - docs/ARCHITECTURE_BLOCKS_AND_SECTIONS.md
    - docs/RENAME_STRIPES_TO_SECTIONS_PLAN.md
    - optional: docs/ARCHITECTURE.md (small clarifying edits only)
  - DROP (hotspots / not allowed in docs-only micro):
    - package.json, package-lock.json
    - prisma/schema.prisma
    - any src/** changes
- Tests to run:
  - None required (docs-only). Optional: npm -s run typecheck
- Notes/risk:
  - Can land before PR #186 if it does not reference editor-wave-only code paths. Keep language conceptual.

PR #138
- Intended outcome:
  - Inventory remaining "Stripe" references and create a migration checklist for moving to "Sections."
- Smallest slice:
  - Docs-only: add/update the inventory doc.
- Files likely touched (confirm non-hotspot):
  - KEEP (docs-only):
    - docs/SECTIONS_MIGRATION_INVENTORY.md
    - optional: docs/RENAME_STRIPES_TO_SECTIONS_PLAN.md (link only)
  - DROP (hotspots / not allowed):
    - package.json, package-lock.json
    - prisma/schema.prisma
    - any src/** changes
- Tests to run:
  - None required (docs-only).
- Notes/risk:
  - Inventory should be reproducible; include the exact rg patterns used.

PR #134
- Intended outcome:
  - Add MembershipTier model and map incoming membership levels from importer.
- Smallest slice:
  - Phase A (docs-only): land docs/IMPORTING/MEMBERSHIP_TIER_MAPPING.md if stable.
  - Phase B (themed wave): schema + migration + importer + seeds + tests together.
- Files likely touched (hotspot):
  - prisma/schema.prisma (hotspot)
  - prisma/migrations/** (hotspot-adjacent)
  - importer/transformers/tests (runtime)
- Tests to run:
  - npm -s run typecheck
  - npm -s run test:unit
  - npm -s run prisma:check-migrations (if applicable)
- Notes/risk:
  - Treat as a dedicated membership/importing themed wave owned by merge captain. Do not micro-salvage into main.

PR #135
- Intended outcome:
  - Modern home stripes + view-as demo surface plus significant docs and tooling changes.
- Smallest slice:
  - Split into buckets:
    1) Docs-only bucket(s): demos runbooks/narratives/member list.
    2) Runtime bucket: view-as (src/app/ViewAsWrapper.tsx + minimal pages).
    3) Admin demo surfaces bucket: src/app/admin/demo/** with minimal nav hooks.
    4) API/OpenAPI bucket: docs/api/openapi.yaml + related docs/api/*.
    5) Finance docs/scripts bucket.
- Files likely touched (hotspots present):
  - package.json/package-lock.json
  - prisma/schema.prisma
  - core admin surfaces
- Tests to run (per bucket):
  - Docs-only: none
  - Runtime: npm -s run typecheck, plus relevant unit/e2e subset
- Notes/risk:
  - This is a re-scope. After PR #186 lands, salvage smallest runtime slice first (view-as). Keep other buckets parked until stabilized.
