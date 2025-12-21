# ClubOS Solutions Onboarding

Copyright (c) Santa Barbara Newcomers Club. All rights reserved.

---

## Purpose

This directory contains documents used during solutions engagements for ClubOS implementations. These are client-facing materials focused on readiness, migration, and operational handoff.

---

## Document Index

### Readiness

| Document | Purpose | Status |
|----------|---------|--------|
| [READINESS_ASSESSMENT.md](./READINESS_ASSESSMENT.md) | Pre-engagement readiness checklist | Active |
| [SCOPE_BOUNDARIES_AND_NON_GOALS.md](./SCOPE_BOUNDARIES_AND_NON_GOALS.md) | Engagement scope control | Active |
| READINESS_REMEDIATION_GUIDE.md | Gap resolution playbook | Planned |

### Intake and Scoping

| Document | Purpose | Status |
|----------|---------|--------|
| [INTAKE_SCHEMA_GUIDE.md](./INTAKE_SCHEMA_GUIDE.md) | Discovery data collection guide | Active |
| [INTAKE_SCHEMA.json](./INTAKE_SCHEMA.json) | Structured intake data format | Active |
| [INTAKE_BUNDLE_LAYOUT.md](./INTAKE_BUNDLE_LAYOUT.md) | Canonical folder structure for intake bundles | Active |
| [PRICED_ENGAGEMENT_READINESS_BLUEPRINT.md](./PRICED_ENGAGEMENT_READINESS_BLUEPRINT.md) | Scoped deliverables template | Active |
| [READINESS_ENGAGEMENT_SKU.md](./READINESS_ENGAGEMENT_SKU.md) | Proposal-ready package pricing | Active |
| [INTAKE_DELIVERABLE_BUNDLE.md](./INTAKE_DELIVERABLE_BUNDLE.md) | Bundle compilation process | Active |
| [INTAKE_VALIDATION_RUNNER_SPEC.md](./INTAKE_VALIDATION_RUNNER_SPEC.md) | Validation tooling specification | Active |

### Tooling

| Tool | Purpose | Status |
|------|---------|--------|
| [validate_intake_schema.mjs](../../scripts/solutions/validate_intake_schema.mjs) | Validate intake JSON against schema | Active |
| [run_intake_validation.sh](../../scripts/solutions/run_intake_validation.sh) | Shell wrapper with report generation | Active |

### Governance and Decisions

| Document | Purpose | Status |
|----------|---------|--------|
| [DECISION_MEMO_AND_PAUSE_PROTOCOL.md](./DECISION_MEMO_AND_PAUSE_PROTOCOL.md) | When and how to pause for decisions | Active |
| [templates/DECISION_MEMO_TEMPLATE.md](./templates/DECISION_MEMO_TEMPLATE.md) | Fill-in decision request form | Active |

### Intake Templates

| Document | Purpose | Status |
|----------|---------|--------|
| [templates/INTAKE_EMAIL_TEMPLATE.md](./templates/INTAKE_EMAIL_TEMPLATE.md) | Client intake request email | Active |
| [templates/INTAKE_WORKBOOK.md](./templates/INTAKE_WORKBOOK.md) | Client discovery questionnaire | Active |
| [templates/DATA_EXPORT_REQUESTS.md](./templates/DATA_EXPORT_REQUESTS.md) | System-specific export instructions | Active |

### Examples

| File | Purpose |
|------|---------|
| [examples/intake.example.json](./examples/intake.example.json) | Minimal valid intake file |

### Migration

**Note:** The Readiness engagement compiles into the Implementation Plan.

| Document | Purpose | Status |
|----------|---------|--------|
| [IMPLEMENTATION_PLAN_SPEC.md](./IMPLEMENTATION_PLAN_SPEC.md) | Exact deliverable produced by Readiness engagement | Active |
| MIGRATION_BLUEPRINT_TEMPLATE.md | Data mapping and timeline template | Planned |
| DATA_IMPORT_CHECKLIST.md | Pre-import validation gates | Planned |
| POLICY_TRANSLATION_WORKSHEET.md | Source system to ClubOS policy mapping | Planned |

### Training and Handoff

| Document | Purpose | Status |
|----------|---------|--------|
| ADMIN_TRAINING_OUTLINE.md | Training session structure | Planned |
| OPERATIONAL_RUNBOOK_TEMPLATE.md | Day-to-day operations guide | Planned |
| HANDOFF_CHECKLIST.md | Engagement completion gates | Planned |

---

## How to Run Validation

Validate an intake.json file before starting implementation work.

### Quick Start

```bash
# From project root
./scripts/solutions/run_intake_validation.sh path/to/intake.json
```

### Example with Sample File

```bash
./scripts/solutions/run_intake_validation.sh docs/solutions/examples/intake.example.json
```

### Options

```bash
# Write report to custom directory
./scripts/solutions/run_intake_validation.sh intake.json --report-dir ./my-reports

# Skip writing report file
./scripts/solutions/run_intake_validation.sh intake.json --no-report
```

### Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | PASS | All validations succeeded; proceed with implementation |
| 1 | FAIL | Required fields missing; fix intake.json before proceeding |
| 2 | WARN | Passed but critical red flags detected; review before proceeding |

### Reports

Validation reports are written to `docs/solutions/reports/` by default:

```
docs/solutions/reports/
└── validation_20251215_143022.txt
```

---

## Usage

1. Begin with READINESS_ASSESSMENT.md to determine engagement viability
2. If GREEN, proceed to Migration Blueprint
3. If YELLOW, create Remediation Plan before proceeding
4. If RED, pause and address blockers

---

## How We Avoid Consulting Drift

Consulting drift occurs when engagements expand beyond original scope, timelines slip without acknowledgment, and work continues despite unresolved blockers. This erodes trust and wastes resources.

ClubOS engagements prevent drift through:

| Mechanism | Document |
|-----------|----------|
| **Explicit scope boundaries** | [SCOPE_BOUNDARIES_AND_NON_GOALS.md](./SCOPE_BOUNDARIES_AND_NON_GOALS.md) |
| **Mandatory pause for ambiguity** | [DECISION_MEMO_AND_PAUSE_PROTOCOL.md](./DECISION_MEMO_AND_PAUSE_PROTOCOL.md) |
| **Written decisions required** | [templates/DECISION_MEMO_TEMPLATE.md](./templates/DECISION_MEMO_TEMPLATE.md) |
| **Readiness gates** | [READINESS_ASSESSMENT.md](./READINESS_ASSESSMENT.md) |

**Core principle:** If we cannot proceed safely, we stop and wait for clarity. We do not guess, assume, or work around missing decisions.

---

## Related Documentation

- [Reliability and Delivery Synthesis](../RELIABILITY_AND_DELIVERY_SYNTHESIS.md) - Board-ready summary
- [Delivery Model Strategy](../DELIVERY_MODEL_STRATEGY.md) - Solutions-led rationale
- [Pricing and Tiers](../DELIVERY_MODEL_PRICING_AND_TIERS.md) - Tier definitions
- [Engineering Philosophy](../ENGINEERING_PHILOSOPHY.md) - Development principles
- [Architectural Charter](../ARCHITECTURAL_CHARTER.md) - System constitution
- [Deployment Readiness Checklist](../reliability/DEPLOYMENT_READINESS_CHECKLIST.md) - Technical deploy gates
- [Readiness Gaps and Risk Acceptance](../reliability/READINESS_GAPS_AND_RISK_ACCEPTANCE.md) - Risk tracking
