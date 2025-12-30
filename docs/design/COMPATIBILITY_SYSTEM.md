<!--
  Copyright © 2025 Murmurant, Inc. All rights reserved.
-->

# Compatibility Rules System

A unified system for enforcing valid combinations across layouts, blocks, sections, and email templates.

---

## Why a Unified System?

Without centralized rules, we'd have:
- Ad-hoc validation scattered across components
- Inconsistent error messages
- Rules that contradict each other
- Hard-to-maintain spaghetti logic

With a unified system:
- Single source of truth for what works together
- Consistent UI/UX for invalid states
- Easy to add new rules
- Testable constraint logic

---

## Where Compatibility Rules Apply

| Domain | Example Rules |
|--------|---------------|
| **Layout + Auth** | Bottom-left auth requires left sidebar |
| **Layout + Sections** | Magazine layout includes sidebar section; Classic doesn't |
| **Section + Blocks** | Sidebar only allows widget-type blocks |
| **Block + Block** | Columns block can't nest inside another Columns |
| **Block + Context** | Event List block requires event page context |
| **Email + Blocks** | Email can't use interactive blocks (calendar widget) |
| **Theme + Layout** | Some themes optimized for specific layouts |
| **Block + Device** | Some blocks hidden on mobile |
| **Page + Blocks** | Member-only blocks require auth |

---

## Compatibility Rule Types

### 1. Requires (Must Have)

> "X requires Y to exist"

```typescript
{ type: "requires", subject: "auth:bottom-left", requires: "layout:has-left-sidebar" }
{ type: "requires", subject: "block:event-list", requires: "context:event-page" }
{ type: "requires", subject: "block:member-directory", requires: "auth:logged-in" }
```

### 2. Excludes (Cannot Have)

> "X cannot be used with Y"

```typescript
{ type: "excludes", subject: "block:columns", excludes: "parent:block:columns" }
{ type: "excludes", subject: "context:email", excludes: "block:interactive-calendar" }
{ type: "excludes", subject: "section:hero", excludes: "block:sidebar-widget" }
```

### 3. Restricts (Only Certain Values)

> "X only allows specific values of Y"

```typescript
{ type: "restricts", subject: "section:sidebar", allows: ["block:news-feed", "block:calendar-mini", "block:sponsors"] }
{ type: "restricts", subject: "context:email", allows: ["block:text", "block:image", "block:button", "block:divider"] }
```

### 4. Suggests (Soft Recommendation)

> "X works better with Y" (warning, not error)

```typescript
{ type: "suggests", subject: "layout:magazine", suggests: "section:sidebar:has-content" }
{ type: "suggests", subject: "block:hero-carousel", suggests: "section:hero" }
```

---

## Rule Schema

```typescript
// src/lib/compatibility/types.ts

type RuleType = "requires" | "excludes" | "restricts" | "suggests";
type Severity = "error" | "warning" | "info";

interface CompatibilityRule {
  id: string;                    // Unique identifier
  type: RuleType;
  severity: Severity;            // error = blocked, warning = allowed with notice

  // What this rule applies to
  subject: string;               // e.g., "auth:bottom-left", "block:columns"

  // The constraint
  requires?: string;             // For "requires" type
  excludes?: string;             // For "excludes" type
  allows?: string[];             // For "restricts" type
  suggests?: string;             // For "suggests" type

  // Human-readable messages
  message: string;               // Shown when rule is violated
  fixAction?: string;            // Suggested fix (e.g., "Switch to Portal layout")
  fixTarget?: string;            // What to change to fix

  // When this rule applies
  context?: string[];            // Optional: only check in certain contexts
}
```

---

## Rule Definitions

### Layout + Auth Rules

```typescript
const layoutAuthRules: CompatibilityRule[] = [
  {
    id: "auth-bottom-left-requires-sidebar",
    type: "requires",
    severity: "error",
    subject: "auth:bottom-left",
    requires: "layout:has-left-sidebar",
    message: "Bottom-left login menu requires a layout with left navigation.",
    fixAction: "Switch to Portal layout",
    fixTarget: "layout:portal",
  },
];
```

### Section + Block Rules

```typescript
const sectionBlockRules: CompatibilityRule[] = [
  {
    id: "sidebar-widget-blocks-only",
    type: "restricts",
    severity: "error",
    subject: "section:sidebar",
    allows: [
      "block:news-feed",
      "block:calendar-mini",
      "block:event-list-compact",
      "block:sponsors",
      "block:text",
      "block:image",
      "block:button",
    ],
    message: "Sidebar only supports widget-style blocks.",
    fixAction: "Move this block to the main content area",
  },
  {
    id: "hero-section-limited-blocks",
    type: "restricts",
    severity: "error",
    subject: "section:hero",
    allows: [
      "block:hero-banner",
      "block:carousel",
      "block:video-background",
      "block:heading",
      "block:button",
    ],
    message: "Hero section only supports hero-style blocks.",
  },
];
```

### Block Nesting Rules

```typescript
const blockNestingRules: CompatibilityRule[] = [
  {
    id: "no-nested-columns",
    type: "excludes",
    severity: "error",
    subject: "block:columns",
    excludes: "parent:block:columns",
    message: "Columns cannot be nested inside other columns.",
    fixAction: "Use a single columns block with more columns",
  },
  {
    id: "no-nested-accordion",
    type: "excludes",
    severity: "error",
    subject: "block:accordion",
    excludes: "parent:block:accordion",
    message: "Accordions cannot be nested inside other accordions.",
  },
];
```

### Email Context Rules

```typescript
const emailRules: CompatibilityRule[] = [
  {
    id: "email-no-interactive",
    type: "excludes",
    severity: "error",
    subject: "context:email",
    excludes: "block:interactive-calendar",
    message: "Interactive calendar cannot be used in emails. Use a static event list instead.",
    fixAction: "Replace with Event List block",
    fixTarget: "block:event-list-static",
  },
  {
    id: "email-no-forms",
    type: "excludes",
    severity: "error",
    subject: "context:email",
    excludes: "block:form",
    message: "Forms cannot be embedded in emails. Link to a form page instead.",
    fixAction: "Replace with Button linking to form",
    fixTarget: "block:button",
  },
  {
    id: "email-allowed-blocks",
    type: "restricts",
    severity: "error",
    subject: "context:email",
    allows: [
      "block:text",
      "block:heading",
      "block:image",
      "block:button",
      "block:divider",
      "block:spacer",
      "block:columns",  // Simple 2-column only
      "block:event-list-static",
      "block:member-greeting",
    ],
    message: "This block type is not supported in emails.",
  },
  {
    id: "email-image-width",
    type: "restricts",
    severity: "warning",
    subject: "context:email",
    allows: ["block:image:max-width-600"],
    message: "Images wider than 600px may not display correctly in all email clients.",
    fixAction: "Resize image to 600px width",
  },
];
```

### Auth-Dependent Block Rules

```typescript
const authBlockRules: CompatibilityRule[] = [
  {
    id: "member-directory-requires-auth",
    type: "requires",
    severity: "error",
    subject: "block:member-directory",
    requires: "page:requires-auth",
    message: "Member Directory can only be placed on member-only pages.",
    fixAction: "Change page visibility to 'Members Only'",
  },
  {
    id: "my-events-requires-auth",
    type: "requires",
    severity: "error",
    subject: "block:my-events",
    requires: "page:requires-auth",
    message: "My Events block requires user to be logged in.",
    fixAction: "Change page visibility to 'Members Only'",
  },
];
```

---

## Validation Engine

```typescript
// src/lib/compatibility/engine.ts

interface ValidationContext {
  layout?: LayoutType;
  authPosition?: AuthPosition;
  section?: string;
  parentBlock?: string;
  context?: "page" | "email";
  pageRequiresAuth?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: RuleViolation[];
  warnings: RuleViolation[];
}

interface RuleViolation {
  ruleId: string;
  message: string;
  fixAction?: string;
  fixTarget?: string;
}

/**
 * Check if a subject is valid in the given context
 */
export function validate(
  subject: string,
  context: ValidationContext
): ValidationResult {
  const errors: RuleViolation[] = [];
  const warnings: RuleViolation[] = [];

  const applicableRules = ALL_RULES.filter((rule) =>
    ruleAppliesTo(rule, subject, context)
  );

  for (const rule of applicableRules) {
    const violation = checkRule(rule, subject, context);
    if (violation) {
      if (rule.severity === "error") {
        errors.push(violation);
      } else {
        warnings.push(violation);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check what's allowed in a given context
 */
export function getAllowed(
  category: "blocks" | "auth-positions" | "sections",
  context: ValidationContext
): string[] {
  // Returns list of valid options for the category in this context
  // Used to populate dropdowns and block palettes
}

/**
 * Check if changing X to Y would break anything
 */
export function validateChange(
  from: ValidationContext,
  to: ValidationContext
): { valid: boolean; adjustments: Adjustment[]; blockers: RuleViolation[] } {
  // Returns what would need to auto-adjust and what would block the change
}
```

---

## UI Integration

### Block Palette Filtering

```tsx
// BlockPalette.tsx

function BlockPalette({ section, context }) {
  const allowedBlocks = getAllowed("blocks", { section, context });

  return (
    <div className="block-palette">
      {ALL_BLOCKS.map((block) => {
        const isAllowed = allowedBlocks.includes(block.id);
        const validation = validate(block.id, { section, context });

        return (
          <BlockOption
            key={block.id}
            block={block}
            disabled={!isAllowed}
            disabledReason={validation.errors[0]?.message}
          />
        );
      })}
    </div>
  );
}
```

### Drag-Drop Validation

```tsx
// When user drags a block
function onDragOver(block: Block, targetSection: string) {
  const result = validate(block.type, {
    section: targetSection,
    parentBlock: getParentBlock(),
    context: isEmailEditor ? "email" : "page",
  });

  if (!result.valid) {
    showDropBlockedIndicator(result.errors[0].message);
    return false;
  }

  showDropAllowedIndicator();
  return true;
}
```

### Settings Panel Warnings

```tsx
// When user changes settings that affect compatibility
function onLayoutChange(newLayout: LayoutType) {
  const result = validateChange(
    { layout: currentLayout, authPosition },
    { layout: newLayout, authPosition }
  );

  if (result.adjustments.length > 0) {
    showNotification({
      type: "info",
      message: `Some settings will be adjusted: ${result.adjustments.map(a => a.message).join(", ")}`,
    });
  }

  if (result.blockers.length > 0) {
    showNotification({
      type: "error",
      message: result.blockers[0].message,
    });
    return; // Prevent change
  }

  applyLayoutChange(newLayout, result.adjustments);
}
```

---

## Email-Specific Rules

Email has the strictest compatibility rules due to email client limitations:

### Allowed in Email

| Block Type | Allowed | Notes |
|------------|---------|-------|
| Text/Heading | ✅ | Full support |
| Image | ✅ | Max 600px width recommended |
| Button | ✅ | Table-based for Outlook |
| Divider | ✅ | Simple HR |
| Spacer | ✅ | Fixed height only |
| Columns | ⚠️ | 2-column max, stacks on mobile |
| Event List | ✅ | Static version only |
| Member Greeting | ✅ | Personalization tokens |

### Not Allowed in Email

| Block Type | Reason |
|------------|--------|
| Calendar Widget | Requires JavaScript |
| Forms | Can't submit from email |
| Video Embed | Not supported |
| Accordion | Requires JavaScript |
| Tabs | Requires JavaScript |
| Map | Requires JavaScript |
| Member Directory | Too dynamic |
| Carousels | Requires JavaScript |

### Email Editor Enforcement

```tsx
// EmailEditor.tsx

function EmailBlockPalette() {
  const emailAllowed = getAllowed("blocks", { context: "email" });

  return (
    <div className="block-palette">
      <BlockCategory title="Email-Safe Blocks">
        {emailAllowed.map((blockId) => (
          <BlockOption key={blockId} block={getBlock(blockId)} />
        ))}
      </BlockCategory>

      <BlockCategory title="Not Available in Email" collapsed>
        <p className="help-text">
          These blocks require features that don't work in email clients.
        </p>
        {getBlocksNotIn(emailAllowed).map((block) => (
          <BlockOption
            key={block.id}
            block={block}
            disabled
            disabledReason="Not supported in email"
          />
        ))}
      </BlockCategory>
    </div>
  );
}
```

---

## Rule Registry

All rules registered centrally:

```typescript
// src/lib/compatibility/rules/index.ts

import { layoutAuthRules } from "./layoutAuth";
import { sectionBlockRules } from "./sectionBlock";
import { blockNestingRules } from "./blockNesting";
import { emailRules } from "./email";
import { authBlockRules } from "./authBlock";

export const ALL_RULES: CompatibilityRule[] = [
  ...layoutAuthRules,
  ...sectionBlockRules,
  ...blockNestingRules,
  ...emailRules,
  ...authBlockRules,
];

// Index by subject for fast lookup
export const RULES_BY_SUBJECT = indexBy(ALL_RULES, "subject");
```

---

## Testing Compatibility Rules

```typescript
// tests/unit/compatibility/rules.test.ts

describe("Layout + Auth compatibility", () => {
  test("bottom-left auth blocked for classic layout", () => {
    const result = validate("auth:bottom-left", { layout: "classic" });
    expect(result.valid).toBe(false);
    expect(result.errors[0].ruleId).toBe("auth-bottom-left-requires-sidebar");
  });

  test("bottom-left auth allowed for portal layout", () => {
    const result = validate("auth:bottom-left", { layout: "portal" });
    expect(result.valid).toBe(true);
  });
});

describe("Email block restrictions", () => {
  test("calendar widget blocked in email", () => {
    const result = validate("block:interactive-calendar", { context: "email" });
    expect(result.valid).toBe(false);
  });

  test("text block allowed in email", () => {
    const result = validate("block:text", { context: "email" });
    expect(result.valid).toBe(true);
  });
});

describe("Block nesting", () => {
  test("columns inside columns blocked", () => {
    const result = validate("block:columns", { parentBlock: "block:columns" });
    expect(result.valid).toBe(false);
  });
});
```

---

## Summary

| Layer | What It Does |
|-------|--------------|
| **Rule Definitions** | Declarative rules in TypeScript |
| **Validation Engine** | Checks rules against context |
| **UI Integration** | Disables invalid options, shows messages |
| **API Enforcement** | Rejects invalid combinations |
| **Testing** | Verifies all rules work correctly |

**Benefits:**
- Single source of truth for all compatibility rules
- Consistent UX across page builder and email editor
- Easy to add new rules as we add features
- Fully testable constraint logic
- Clear error messages with actionable fixes
