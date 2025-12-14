# Payments Admin Ops Contract

Worker 4 — Payments Admin Ops Contract — Report

## Roles
- Finance: capture, cancel, refund
- Event Chair: view only
- Tech: diagnostics

## Allowed Actions
- Capture authorized intent
- Cancel uncaptured intent
- Refund captured payment

## Preconditions
- Refund requires captured status
- Cancel forbidden after capture

## Required Display
- Member
- Event
- Amount
- Provider
- Status
- Audit trail

## Safety
- Explicit confirmation required
- Amount shown twice
- Irreversible warnings

## Tests
- Allow: Finance role
- Deny: non-Finance roles

## Non-Goals
- No ledger
- No accounting exports

## Verdict
READY FOR REVIEW
