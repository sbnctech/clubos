# Rename plan: Stripe -> Section

Date: 2025-12-20
Scope: UI layout wrapper naming only

## Goal

Replace the term "Stripe" with "Section" throughout the codebase and documentation, while preserving behavior and minimizing risk.

This is a naming migration:
- No design change implied.
- No change to the authoring concept: Blocks remain the primary unit.

## Rationale

"Stripe" has been interpreted as a product concept similar to legacy website builders.
The intended product concept is Blocks. The layout wrapper is purely structural and should be called Section.

## Phases

### Phase 0: Documentation + guidelines (immediate)
- Update architecture docs to define Blocks vs Sections.
- Update PR language to describe "block-based pages with section layout wrappers".

### Phase 1: Add Section wrappers (low-risk)
- Add src/components/sections/Section.tsx and HeroSection.tsx
- Internally delegate to existing Stripe components
- Mark Stripe components as deprecated via comments
- Export both names temporarily

### Phase 2: Migrate imports (mechanical)
- Update imports across pages/components to use sections/
- Keep stripes/ for compatibility during rollout
- Update any docs that reference stripes

### Phase 3: Remove stripes (cleanup)
- Remove src/components/stripes directory
- Remove any remaining mentions of Stripe/HeroStripe
- Ensure tests and docs use Section terminology only

## Acceptance criteria

- No remaining references to "Stripe" in new code paths for page composition.
- docs/ARCHITECTURE.md and supporting doc clearly distinguish Blocks vs Sections.
- A follow-up PR completes Phase 1 and (optionally) Phase 2 with a mechanical import migration.
