# Follow-up PR draft: Make Blocks explicit; deprecate Stripe

Title:
  refactor(ui): introduce Section wrappers and codify Block composition

Motivation:
- Make the intended UI architecture explicit: Blocks are first-class; Sections are layout-only.
- Deprecate legacy "Stripe" naming to avoid confusion.

Scope:
- Introduce src/components/sections/ (Section, HeroSection)
- Keep src/components/stripes/ for backward compatibility, but mark deprecated
- Update a small number of key pages to import Section/HeroSection
- Add documentation and a small set of unit tests around composition boundaries (optional)

Changes (proposed):
1. Add new components:
   - src/components/sections/Section.tsx
   - src/components/sections/HeroSection.tsx
   - src/components/sections/index.ts

2. Deprecation notes:
   - Add header comments to src/components/stripes/Stripe.tsx and HeroStripe.tsx:
     "Deprecated: use Section/HeroSection"

3. Mechanical migration (starter set):
   - Update member home and public home composition to use Section/HeroSection imports
   - Keep behavior identical

4. Documentation:
   - Ensure docs/ARCHITECTURE.md references Blocks and Sections
   - Add docs/ARCHITECTURE_BLOCKS_AND_SECTIONS.md
   - Add docs/RENAME_STRIPES_TO_SECTIONS_PLAN.md

Out of scope for this PR:
- Full repository-wide rename (can be a later mechanical PR)
- Page editor tooling (separate project)

Test plan:
- npm run lint
- npm run typecheck
- existing e2e smoke tests for home pages
- optional: unit test that Section is layout-only wrapper

Rollout:
- Merge with Stripe still present but deprecated.
- Follow with a mechanical PR to update all imports to sections/ and remove stripes/.
