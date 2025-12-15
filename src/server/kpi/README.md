# KPI Engine

Server-side KPI evaluation engine for the ClubOS board dashboard.

## Architecture

```
src/server/kpi/
├── types.ts           # Core type definitions
├── registry.ts        # Evaluator registry singleton
├── engine.ts          # Engine runner with timeout protection
├── evaluators/        # Individual KPI evaluators
│   ├── index.ts       # Evaluator exports and registration
│   ├── website-uptime.ts
│   └── email-bounce-rate.ts
└── index.ts           # Public API exports
```

## Usage

```typescript
import { createKPIEngine, registerBuiltinEvaluators } from "@/server/kpi";

// Register built-in evaluators at startup
registerBuiltinEvaluators();

// Create engine and run all KPIs
const engine = createKPIEngine();
const summary = await engine.runAll();

console.log(summary.overallStatus); // "OK" | "WARNING" | "CRITICAL" | "UNKNOWN"
```

## Status Hierarchy

```
CRITICAL > WARNING > UNKNOWN > OK
```

## Built-in Evaluators

| ID | Name | Status |
|----|------|--------|
| `website-uptime` | Website Uptime | Stub (returns UNKNOWN) |
| `email-bounce-rate` | Email Bounce Rate | Stub (returns UNKNOWN) |
