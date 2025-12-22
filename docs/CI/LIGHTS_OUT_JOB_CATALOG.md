# Lights-Out Job Catalog (Docs-Only)

Purpose: Maintain forward progress while hotspot work is paused (editor wave, schema, lockfiles, core admin surfaces).
Lights-out jobs MUST avoid hotspots. If a task needs a hotspot, it is NOT lights-out.

Hotspots to avoid (non-exhaustive):
- prisma/schema.prisma
- prisma/migrations/**
- package.json, package-lock.json
- src/app/admin/** core nav/search/layout
- src/app/admin/content/pages/** (publishing editor surfaces)
- src/lib/publishing/** (editor runtime)
- src/app/(public)/** routing primitives when editor wave is in-flight

Eligible lights-out work (examples):
- CI and process docs (merge policy, hotspot map, PR size rules, branching)
- Role/permission documentation (RBAC descriptions, audit expectations)
- Release classification guidance (stable vs experimental)
- Test strategy documentation (unit vs e2e boundaries)
- Runbooks that do not require code changes (triage steps, “how to verify”)
- Backlog grooming documents (parking rules, salvage templates, risk notes)

Non-eligible (not lights-out):
- Any change that touches hotspots above
- Refactors that cause large diffs or drift
- “Quick fixes” in editor/publishing runtime while editor wave is pending

Definition of Done for a lights-out PR:
- Docs only (no JS/TS changes)
- No hotspot files modified
- Small and scannable (prefer < 200 LOC net)
- Clear title, clear scope, no mixed topics
