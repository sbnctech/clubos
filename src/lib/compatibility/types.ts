/**
 * Compatibility Engine Types
 *
 * Type definitions for the unified compatibility rules system.
 * Rules enforce valid combinations across layouts, blocks, sections, and contexts.
 *
 * Charter: P4 (no hidden rules), P6 (human-first UI), P8 (stable contracts)
 *
 * @see docs/design/COMPATIBILITY_SYSTEM.md
 */

import { z } from "zod";

// ============================================================================
// Rule Type Enum
// ============================================================================

/**
 * Types of compatibility rules.
 *
 * - requires: Subject requires target to exist
 * - excludes: Subject cannot be used with target
 * - restricts: Subject only allows specific values
 * - suggests: Subject works better with target (soft warning)
 */
export const ruleTypeSchema = z.enum([
  "requires",
  "excludes",
  "restricts",
  "suggests",
]);

export type RuleType = z.infer<typeof ruleTypeSchema>;

// ============================================================================
// Severity Enum
// ============================================================================

/**
 * Rule violation severity.
 *
 * - error: Blocks the action, must be fixed
 * - warning: Allowed but user should be aware
 * - info: Informational only
 */
export const severitySchema = z.enum(["error", "warning", "info"]);

export type Severity = z.infer<typeof severitySchema>;

// ============================================================================
// Rule Domain Enum
// ============================================================================

/**
 * Domains where compatibility rules apply.
 */
export const ruleDomainSchema = z.enum([
  "layout-auth", // Layout + auth position compatibility
  "layout-section", // Layout + section compatibility
  "section-block", // Section + block type compatibility
  "block-nesting", // Block nesting rules
  "block-context", // Block + page context
  "email-context", // Email-specific restrictions
  "page-auth", // Page visibility + auth blocks
  "theme-layout", // Theme + layout compatibility
]);

export type RuleDomain = z.infer<typeof ruleDomainSchema>;

// ============================================================================
// Compatibility Rule Schema
// ============================================================================

/**
 * A single compatibility rule definition.
 */
export const compatibilityRuleSchema = z.object({
  // Identity
  id: z.string().min(1).describe("Unique rule identifier"),
  domain: ruleDomainSchema.describe("Rule domain"),

  // Rule type and severity
  type: ruleTypeSchema.describe("Rule type"),
  severity: severitySchema.describe("Violation severity"),

  // What this rule applies to (e.g., "auth:bottom-left", "block:columns")
  subject: z.string().min(1).describe("Subject of the rule"),

  // Constraints (depends on rule type)
  requires: z.string().optional().describe("Required target (for requires type)"),
  excludes: z.string().optional().describe("Excluded target (for excludes type)"),
  allows: z.array(z.string()).optional().describe("Allowed values (for restricts type)"),
  suggests: z.string().optional().describe("Suggested target (for suggests type)"),

  // Human-readable messages
  message: z.string().min(1).describe("Message shown when rule is violated"),
  fixAction: z.string().optional().describe("Suggested fix action"),
  fixTarget: z.string().optional().describe("Target to change to fix"),

  // Context filtering (optional: only check in certain contexts)
  contexts: z.array(z.string()).optional().describe("Contexts where this rule applies"),

  // Metadata
  description: z.string().optional().describe("Detailed rule description"),
});

export type CompatibilityRule = z.infer<typeof compatibilityRuleSchema>;

// ============================================================================
// Validation Context Schema
// ============================================================================

/**
 * Context for validation checks.
 * Provides information about where validation is happening.
 */
export const validationContextSchema = z.object({
  // Layout context
  layout: z.string().optional().describe("Current layout type"),
  authPosition: z.string().optional().describe("Auth UI position"),

  // Section context
  section: z.string().optional().describe("Current section type"),
  sectionId: z.string().optional().describe("Section instance ID"),

  // Block context
  parentBlock: z.string().optional().describe("Parent block type (for nesting)"),
  blockDepth: z.number().optional().describe("Nesting depth"),

  // Page context
  pageContext: z.enum(["page", "email", "preview"]).optional().describe("Page type"),
  pageRequiresAuth: z.boolean().optional().describe("Whether page requires authentication"),
  pageVisibility: z.string().optional().describe("Page visibility setting"),

  // Editor context
  editorMode: z.enum(["easy", "standard", "power"]).optional().describe("Editor mode"),
});

export type ValidationContext = z.infer<typeof validationContextSchema>;

// ============================================================================
// Validation Result Types
// ============================================================================

/**
 * A single rule violation.
 */
export interface RuleViolation {
  ruleId: string;
  domain: RuleDomain;
  severity: Severity;
  message: string;
  fixAction?: string;
  fixTarget?: string;
  subject: string;
}

/**
 * Result of a validation check.
 */
export interface ValidationResult {
  valid: boolean;
  errors: RuleViolation[];
  warnings: RuleViolation[];
  info: RuleViolation[];
}

/**
 * Result of a change validation (what would happen if we change).
 */
export interface ChangeValidationResult {
  valid: boolean;
  blockers: RuleViolation[];
  adjustments: Adjustment[];
}

/**
 * An automatic adjustment that would be made.
 */
export interface Adjustment {
  target: string;
  from: string;
  to: string;
  reason: string;
}

// ============================================================================
// Rule Filter Options
// ============================================================================

/**
 * Options for filtering rules.
 */
export interface RuleFilterOptions {
  domain?: RuleDomain | RuleDomain[];
  severity?: Severity | Severity[];
  subject?: string;
  context?: string[];
}

// ============================================================================
// Block Category Types (for section-block rules)
// ============================================================================

/**
 * Block categories for the page builder.
 */
export const blockCategorySchema = z.enum([
  "text", // Heading, Paragraph, Quote, List
  "media", // Image, Gallery, Video, File
  "layout", // Columns, Spacer, Divider
  "widgets", // Calendar, News Feed, Event List
  "forms", // Contact, RSVP, Survey
  "navigation", // Menu, Breadcrumb, TOC
  "embeds", // Map, Social, YouTube
  "interactive", // Accordion, Tabs, Carousel
]);

export type BlockCategory = z.infer<typeof blockCategorySchema>;

// ============================================================================
// Context Types
// ============================================================================

/**
 * Page contexts that affect block availability.
 */
export type PageContext = "page" | "email" | "preview";

/**
 * Check if a context is email (for email-specific rules).
 */
export function isEmailContext(context?: PageContext): boolean {
  return context === "email";
}

/**
 * Check if a context is preview (for preview-specific rules).
 */
export function isPreviewContext(context?: PageContext): boolean {
  return context === "preview";
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Subject identifier format: "type:value" or "type:subtype:value"
 * Examples: "auth:bottom-left", "block:columns", "section:sidebar"
 */
export type SubjectIdentifier = string;

/**
 * Parse a subject identifier into parts.
 */
export function parseSubject(subject: SubjectIdentifier): {
  type: string;
  subtype?: string;
  value: string;
} {
  const parts = subject.split(":");
  if (parts.length === 2) {
    return { type: parts[0], value: parts[1] };
  } else if (parts.length === 3) {
    return { type: parts[0], subtype: parts[1], value: parts[2] };
  }
  return { type: subject, value: subject };
}

/**
 * Create a subject identifier from parts.
 */
export function createSubject(
  type: string,
  value: string,
  subtype?: string
): SubjectIdentifier {
  if (subtype) {
    return `${type}:${subtype}:${value}`;
  }
  return `${type}:${value}`;
}

// ============================================================================
// Empty Results
// ============================================================================

/**
 * Empty validation result (everything valid).
 */
export const EMPTY_VALIDATION_RESULT: ValidationResult = {
  valid: true,
  errors: [],
  warnings: [],
  info: [],
};

/**
 * Empty change validation result.
 */
export const EMPTY_CHANGE_RESULT: ChangeValidationResult = {
  valid: true,
  blockers: [],
  adjustments: [],
};
