# Docs-Only PR Checklist

Use this checklist before opening a docs-only PR.

Scope:
- [ ] Docs-only change (no JS/TS, no config changes)
- [ ] Avoids hotspots (schema, migrations, lockfiles, core admin, publishing editor runtime)

Quality:
- [ ] ASCII only (no smart quotes/dashes)
- [ ] Short paragraphs, scannable headings
- [ ] Clear “why this exists” at top
- [ ] Links to related docs/PRs where helpful

Process:
- [ ] Label: docs-only
- [ ] Label: merge-captain-only (if we want single-owner discipline)
- [ ] Label: theme-ci (if CI/process related)
- [ ] Comment: safe to merge anytime; no hotspots touched
