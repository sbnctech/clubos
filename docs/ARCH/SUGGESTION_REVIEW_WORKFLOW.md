# Suggestion Review Workflow

This document defines the human-in-the-loop workflow for reviewing and accepting migration suggestions.

**Related:** Epic #306 (Assisted Organizational Representation Reconstruction)

---

## Overview

When the system generates suggestions from an Intent Manifest, those suggestions must go through a review workflow before affecting production. This ensures:

- No silent automation (Charter principle)
- Abort is always possible
- Every change is traceable to a human decision

---

## Suggestion Data Model

```typescript
/**
 * A suggestion is a proposed action derived from observed intent
 */
interface Suggestion {
  suggestionId: string;           // UUID
  manifestId: string;             // Source manifest
  createdAt: string;              // ISO timestamp

  // What we're suggesting
  suggestionType: SuggestionType;
  targetEntity: EntityReference;
  proposedAction: ProposedAction;

  // Traceability
  derivedFrom: SourceReference[];  // What observations led to this
  confidence: number;              // 0-100, how confident we are
  explanation: string;             // Human-readable reasoning

  // Review state
  status: SuggestionStatus;
  reviewedBy?: string;             // Who reviewed
  reviewedAt?: string;             // When reviewed
  reviewNotes?: string;            // Reviewer comments
  modifications?: Modification[];  // Changes made during review
}

type SuggestionType =
  | "create_page"         // Create new page
  | "create_navigation"   // Add navigation item
  | "set_branding"        // Set colors, logo, etc.
  | "upload_asset"        // Import asset
  | "create_section"      // Add section to page
  | "map_content"         // Map WA widget to Murmurant component
  | "set_metadata";       // Set page metadata

interface EntityReference {
  entityType: "page" | "navigation" | "asset" | "organization" | "section";
  entityId?: string;      // ID if existing entity
  entityPath?: string;    // Path for new entities
}

interface ProposedAction {
  operation: "create" | "update" | "delete";
  payload: Record<string, unknown>;  // Entity-specific data
}

interface SourceReference {
  manifestElementType: "page" | "navigation" | "asset" | "style" | "identity";
  elementId: string;
  fieldPath?: string;     // Specific field if relevant
}

type SuggestionStatus =
  | "pending"             // Awaiting review
  | "accepted"            // Approved, ready to apply
  | "rejected"            // Declined
  | "modified"            // Accepted with changes
  | "applied"             // Successfully applied
  | "failed";             // Apply failed

interface Modification {
  fieldPath: string;
  originalValue: unknown;
  modifiedValue: unknown;
  modifiedBy: string;
  modifiedAt: string;
}
```

---

## Review States

```
                    ┌─────────────┐
                    │   pending   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ rejected │ │ accepted │ │ modified │
        └──────────┘ └────┬─────┘ └────┬─────┘
                          │            │
                          └─────┬──────┘
                                │
                                ▼
                          ┌──────────┐
                          │ applied  │
                          └──────────┘
                                │
                                ▼ (on error)
                          ┌──────────┐
                          │  failed  │
                          └──────────┘
```

### State Definitions

| State | Description | Allowed Transitions |
|-------|-------------|---------------------|
| pending | Awaiting human review | accepted, rejected, modified |
| accepted | Approved as-is | applied, failed |
| rejected | Declined, will not apply | (terminal) |
| modified | Approved with changes | applied, failed |
| applied | Successfully applied to Murmurant | (terminal) |
| failed | Apply operation failed | pending (retry) |

---

## Review Workflow

### Phase 1: Suggestion Generation

```typescript
// After manifest is reviewed, generate suggestions
async function generateSuggestions(manifest: IntentManifest): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];

  // Generate page suggestions
  for (const page of manifest.pages) {
    suggestions.push(createPageSuggestion(page, manifest));
  }

  // Generate navigation suggestions
  for (const nav of manifest.navigation) {
    suggestions.push(createNavSuggestion(nav, manifest));
  }

  // Generate branding suggestions
  if (manifest.identity || manifest.styles) {
    suggestions.push(createBrandingSuggestion(manifest));
  }

  return suggestions;
}
```

### Phase 2: Review Interface

The operator reviews suggestions through a dedicated UI:

1. **List View**: All suggestions grouped by type
2. **Detail View**: Individual suggestion with:
   - What is proposed
   - Why (linked observations from manifest)
   - Preview of result
   - Accept / Reject / Modify actions

### Phase 3: Batch Operations

Operators can perform batch operations:

```typescript
// Accept all suggestions of a type
async function acceptAllOfType(sessionId: string, type: SuggestionType): Promise<void>;

// Reject all low-confidence suggestions
async function rejectLowConfidence(sessionId: string, threshold: number): Promise<void>;
```

### Phase 4: Apply

Once review is complete:

```typescript
// Apply all accepted/modified suggestions
async function applySuggestions(sessionId: string): Promise<ApplyResult> {
  const suggestions = await getAcceptedSuggestions(sessionId);

  for (const suggestion of suggestions) {
    try {
      await applySuggestion(suggestion);
      suggestion.status = "applied";
    } catch (error) {
      suggestion.status = "failed";
      suggestion.reviewNotes = error.message;
    }
    await saveSuggestion(suggestion);
  }

  return summarizeResults(suggestions);
}
```

---

## Audit Trail

Every state transition is logged:

```typescript
interface SuggestionAuditEntry {
  suggestionId: string;
  timestamp: string;
  actor: string;                    // User or system ID
  action: "created" | "reviewed" | "modified" | "applied" | "failed";
  previousStatus?: SuggestionStatus;
  newStatus: SuggestionStatus;
  details?: Record<string, unknown>;
}
```

---

## Granularity Options

Operators can choose review granularity:

| Mode | Description | Use Case |
|------|-------------|----------|
| **Individual** | Review each suggestion one by one | High-stakes migrations, complex content |
| **Grouped** | Review by suggestion type | Standard migrations |
| **Bulk** | Accept all above threshold, review exceptions | Simple migrations, trusted extraction |

---

## Abort Mechanics

At any point before `applied` status:

1. **Soft Abort (Pause)**: Stop reviewing, preserve state for later
2. **Hard Abort (Discard)**: Mark all pending as rejected, log reason

```typescript
async function abortSession(
  sessionId: string,
  mode: "pause" | "discard",
  reason: string
): Promise<void> {
  const session = await getSession(sessionId);

  if (mode === "discard") {
    // Mark all non-applied suggestions as rejected
    for (const suggestion of session.suggestions) {
      if (suggestion.status === "pending" || suggestion.status === "accepted") {
        suggestion.status = "rejected";
        suggestion.reviewNotes = `Aborted: ${reason}`;
      }
    }
  }

  session.status = mode === "pause" ? "paused" : "aborted";
  session.abortReason = reason;
  await saveSession(session);

  // Log audit entry
  await logAudit({
    sessionId,
    action: mode === "pause" ? "session_paused" : "session_aborted",
    reason,
  });
}
```

---

## Commit Gate

Suggestions can only be applied when:

1. All suggestions are in terminal state (accepted, rejected, modified, or already applied)
2. Manifest status is "reviewed"
3. Operator explicitly triggers apply
4. (Optional) Customer approval for customer-visible changes

```typescript
function canCommit(session: ReviewSession): CommitEligibility {
  const pending = session.suggestions.filter(s => s.status === "pending");

  if (pending.length > 0) {
    return {
      eligible: false,
      reason: `${pending.length} suggestions still pending review`,
    };
  }

  if (session.manifest.status !== "reviewed") {
    return {
      eligible: false,
      reason: "Manifest must be reviewed before commit",
    };
  }

  return { eligible: true };
}
```

---

## Integration with Cutover Mode (#301)

When operating in Cutover Rehearsal Mode:

1. Suggestions are applied to a **preview environment**, not production
2. Customer can review results before final commit
3. Abort discards preview, WA remains authoritative
4. Commit promotes preview to production

See Epic #301 for cutover-specific mechanics.

---

## Related Documents

- [INTENT_MANIFEST_SCHEMA.md](./INTENT_MANIFEST_SCHEMA.md) - Source data model
- Epic #306 - Parent epic
- Epic #301 - Cutover Rehearsal Mode
