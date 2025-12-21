# A8: Undo/Redo Polish and Hardening

Copyright (c) Santa Barbara Newcomers Club

## Overview

A8 builds on the A7 undo/redo foundation with polish and hardening improvements:

- RevisionState normalization for consistent data handling
- UI improvements for better user experience
- Concurrency protection to prevent race conditions
- Keyboard shortcut improvements

## Changes

### 1. RevisionState Normalizer (`src/lib/publishing/revisions.ts`)

Added `normalizeRevisionState()` helper that guarantees consistent revision state values:

```typescript
export function normalizeRevisionState(raw: Partial<RevisionState>): RevisionState {
  const undoCount = Math.max(0, Math.floor(Number(raw.undoCount) || 0));
  const redoCount = Math.max(0, Math.floor(Number(raw.redoCount) || 0));
  const totalRevisions = Math.max(0, Math.floor(Number(raw.totalRevisions) || 0));

  return {
    undoCount,
    redoCount,
    canUndo: undoCount > 0,
    canRedo: redoCount > 0,
    currentPosition: 0,
    totalRevisions,
  };
}
```

Properties:

- All counts are guaranteed to be non-negative integers
- Boolean flags (`canUndo`, `canRedo`) are derived from counts
- Handles NaN, undefined, floating points, and string coercion
- `getRevisionState()` now uses this normalizer

### 2. UI Polish (`src/app/admin/content/pages/[id]/PageEditorClient.tsx`)

Improvements to the undo/redo controls:

- **Tooltips**: Undo button shows "Undo (Cmd+Z)", Redo shows "Redo (Cmd+Shift+Z)"
- **Disabled states**: Buttons properly disable when `canUndo`/`canRedo` is false, or during save operations
- **Revision indicator**: Shows "Undo: N  Redo: M" format when either count > 0
- **Keyboard shortcuts**: Skip when focus is in INPUT, TEXTAREA, or contentEditable elements

### 3. Concurrency Protection (Undo/Redo Endpoints)

Both `/api/admin/content/pages/[id]/undo` and `/api/admin/content/pages/[id]/redo` now implement optimistic locking:

1. Fetch page with `updatedAt` timestamp
2. Store `expectedUpdatedAt` before applying undo/redo
3. Use `updateMany` with `updatedAt` condition as optimistic lock
4. Return 409 Conflict if `updated.count === 0` (concurrent mutation detected)

**409 Response format**:

```json
{
  "error": "Conflict",
  "message": "Action unavailable while changes are being saved. Try again."
}
```

The client already handles this via the existing error display mechanism.

## Tests

Added tests in `tests/unit/publishing/revisions.spec.ts`:

- `normalizes valid counts correctly`
- `clamps negative counts to zero`
- `floors floating point counts`
- `handles NaN and undefined values`
- `handles string coercion`
- `handles empty object`
- `derives canUndo from undoCount correctly`
- `derives canRedo from redoCount correctly`
- `always sets currentPosition to 0`

## Charter Compliance

- **P7 (Audit Trail)**: Undo/redo actions continue to be logged
- **P4 (Authorization)**: Requires `publishing:manage` capability
- **N3 (Scope creep)**: No new features, only polish and hardening

## Files Changed

- `src/lib/publishing/revisions.ts` - Added normalizer, updated getRevisionState
- `src/app/admin/content/pages/[id]/PageEditorClient.tsx` - UI polish
- `src/app/api/admin/content/pages/[id]/undo/route.ts` - Concurrency protection
- `src/app/api/admin/content/pages/[id]/redo/route.ts` - Concurrency protection
- `tests/unit/publishing/revisions.spec.ts` - Added normalizer tests
- `docs/editor/A8_UNDO_REDO_POLISH.md` - This document
