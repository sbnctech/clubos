# Migration Factory Spec

## Goals
- Safe phased migration (no big bang)
- Outcome parity before cutover
- Provenance and trust by design
- Low founder synchronous load

## Core Components
1. Connectors (WA API, CE CSV, WebContentHarvester)
2. Canonical Staging Model (source-agnostic)
3. Transformer/Normalizer (mapping rules + steward overrides)
4. Parity Simulator (replay business events)
5. Cutover Orchestrator (gates + approvals)
6. Observability + alerts

## Non-goals
- Default bi-directional sync between systems (too fragile)
