# Theme/Template Import Decision Memo

Worker 4 — Q-028 Theme/Template Import Decision — Report

## Goal

Determine whether and how to import themes and templates from the legacy
system into ClubOS, balancing adoption speed against long-term maintainability.

## Non-Goals

- This memo is not a commitment to implement any import capability.
- This memo does not define implementation timelines.
- This memo does not promise pixel-perfect fidelity.

---

## What Can Be Imported Realistically

### Category A: Visual Assets (LOW RISK)

Importable:
- Logo images (PNG, SVG)
- Brand colors (hex values)
- Typography choices (font families, sizes)
- Favicon and social preview images

Method: Manual extraction or automated scrape of CSS variables.
Effort: Low.
Fidelity: High.

### Category B: Content Structure (MEDIUM RISK)

Importable:
- Page hierarchy (sitemap)
- Navigation menu structure
- Section ordering within pages

Method: API query or authenticated sitemap crawl.
Effort: Medium.
Fidelity: Medium (structure only, not styling).

### Category C: Page Content (MEDIUM-HIGH RISK)

Importable:
- Text content (headings, paragraphs, lists)
- Embedded images (URLs)
- Basic HTML structure

Method: Authenticated scrape with HTML-to-Markdown conversion.
Effort: Medium-High.
Fidelity: Variable (depends on source markup quality).

### Category D: Email Templates (HIGH RISK)

Importable (if accessible):
- Subject line patterns
- Body text templates
- Merge field mappings

Method: Manual extraction from admin interface or template export.
Effort: High.
Fidelity: Low (merge fields likely incompatible).

---

## What Cannot Be Imported Safely

### Legacy Widget Behaviors

Why: Widgets are tightly coupled to the legacy runtime. Importing their
markup without their JavaScript would produce broken experiences.

### Custom CSS Overrides

Why: Legacy CSS may depend on undocumented class names or specificity
hacks that do not translate to ClubOS component architecture.

### Login-Gated Dynamic Content

Why: Content that requires authentication and is dynamically generated
cannot be reliably scraped without session management complexity.

### Template Logic (Conditionals, Loops)

Why: Legacy template syntax is proprietary. Converting to ClubOS templates
requires semantic understanding, not string replacement.

### Payment/Invoice Templates

Why: Financial templates must match ClubOS data model exactly. Importing
legacy formats risks incorrect amounts, dates, or recipient data.

---

## Two Paths

### Path A: Compatibility Layer (Emulate Legacy Concepts)

Description: Build ClubOS to understand and render legacy template syntax
and widget references. ClubOS becomes a runtime for legacy themes.

Pros:
- Maximum visual fidelity during transition
- Minimal content rework required
- Board sees "same site, new backend"

Cons:
- Permanent maintenance burden for legacy parser
- ClubOS architecture constrained by legacy assumptions
- Every ClubOS improvement must consider legacy compatibility
- Technical debt accumulates indefinitely

Long-term cost: HIGH. The compatibility layer becomes a second codebase
that must be maintained, tested, and secured in perpetuity.

### Path B: Translation Layer (Convert Into ClubOS Model)

Description: Extract content and assets from legacy, translate them into
native ClubOS primitives (theme tokens, page blocks, content entries).
Legacy concepts are abandoned after migration.

Pros:
- ClubOS remains architecturally clean
- No ongoing legacy maintenance
- Full access to ClubOS improvements
- Clear migration endpoint

Cons:
- Higher upfront effort to build translators
- Some visual drift from legacy (not pixel-perfect)
- Content review required post-translation
- Board must accept "recognizably similar" not "identical"

Long-term cost: LOW. One-time translation effort with no ongoing burden.

---

## Recommendation

**Path B: Translation Layer**

Rationale:
1. ClubOS must remain maintainable for volunteer Tech Chairs.
2. Compatibility layers create permanent complexity.
3. Board anxiety about visual changes is addressable through previews.
4. Legacy system is not a long-term reference architecture.

### Gating Criteria for Translation Approach

Before committing to Path B, confirm:

1. Board accepts "recognizably SBNC" rather than pixel parity.
2. API access provides sufficient entity data for core migration.
3. At least one Tech Chair or Board member can review translated content.
4. Parallel run infrastructure exists to validate translations.

If any gate fails, revisit decision before proceeding.

---

## Risks and Mitigations

### Risk 1: Board Rejects Visual Drift

Impact: High (blocks adoption).
Mitigation: Provide side-by-side preview during parallel run. Document
which differences are intentional improvements vs translation artifacts.

### Risk 2: Scraping Breaks Mid-Migration

Impact: Medium (delays timeline).
Mitigation: Cache all scraped content immediately. Version snapshots.
Do not depend on repeated scraping.

### Risk 3: Email Templates Produce Incorrect Merge Output

Impact: High (member-facing errors).
Mitigation: Do not import email templates. Rebuild from scratch using
ClubOS merge fields with human review before activation.

### Risk 4: Page Structure Translation Loses Semantic Meaning

Impact: Medium (content quality degradation).
Mitigation: Human review gate for every translated page. Flag pages
with complex markup for manual recreation.

### Risk 5: Legacy Auth Changes Block Content Extraction

Impact: Medium (incomplete data).
Mitigation: Complete all content extraction before announcing migration.
Maintain admin credentials in secure vault with backup access.

### Risk 6: Translated Theme Tokens Produce Inconsistent UI

Impact: Low-Medium (cosmetic issues).
Mitigation: Define ClubOS token defaults. Map legacy values to nearest
ClubOS token rather than creating custom values.

### Risk 7: Import Creates False Confidence in Data Quality

Impact: Medium (hidden errors surface post-cutover).
Mitigation: Treat all imported content as "draft" status. Require
explicit publish action after human review.

---

## Parallel Run Validation

Imported assets can be validated without affecting production:

### Visual Assets
- Deploy to ClubOS staging environment.
- Generate screenshot comparisons (legacy vs ClubOS).
- Board review via private preview URL.

### Content Structure
- Import into ClubOS as draft pages (unpublished).
- Generate sitemap diff report.
- Verify navigation matches legacy hierarchy.

### Page Content
- Import as draft content entries.
- Run automated checks: broken links, missing images, malformed HTML.
- Human spot-check sample pages per category.

### Email Templates
- Do not import.
- Build native templates with test sends to admin addresses only.
- Compare output manually before activating.

### Validation Exit Criteria
- Zero P0 discrepancies (access, eligibility).
- Fewer than 5 P1 discrepancies (content meaning).
- Board sign-off on visual direction.

---

## Summary

| Category | Import? | Method | Risk |
|----------|---------|--------|------|
| Visual assets | Yes | Extract + map to tokens | Low |
| Content structure | Yes | Crawl + translate | Medium |
| Page content | Selective | Scrape + review | Medium-High |
| Email templates | No | Rebuild natively | N/A |
| Widget behaviors | No | N/A | N/A |
| Custom CSS | No | N/A | N/A |

**Recommended path**: Translation Layer (Path B).
**Gating criteria**: Board acceptance, API access, reviewer availability, parallel run ready.

---

## Verdict

READY FOR REVIEW
