/**
 * Compatibility Engine
 *
 * Core validation engine for enforcing compatibility rules.
 * Checks rules against contexts and provides actionable results.
 *
 * Charter: P4 (no hidden rules), P6 (human-first UI)
 *
 * @see docs/design/COMPATIBILITY_SYSTEM.md
 */

import type {
  CompatibilityRule,
  ValidationContext,
  ValidationResult,
  RuleViolation,
  ChangeValidationResult,
  Adjustment,
  RuleFilterOptions,
  RuleDomain,
} from "./types";
import { EMPTY_VALIDATION_RESULT, parseSubject } from "./types";

// ============================================================================
// Rule Registry
// ============================================================================

/**
 * Central registry of all compatibility rules.
 * Rules are added via registerRule() or registerRules().
 */
const ruleRegistry: Map<string, CompatibilityRule> = new Map();

/**
 * Index of rules by subject for fast lookup.
 */
const rulesBySubject: Map<string, Set<string>> = new Map();

/**
 * Index of rules by domain for filtering.
 */
const rulesByDomain: Map<RuleDomain, Set<string>> = new Map();

// ============================================================================
// Rule Registration
// ============================================================================

/**
 * Register a single compatibility rule.
 */
export function registerRule(rule: CompatibilityRule): void {
  // Add to main registry
  ruleRegistry.set(rule.id, rule);

  // Index by subject
  if (!rulesBySubject.has(rule.subject)) {
    rulesBySubject.set(rule.subject, new Set());
  }
  rulesBySubject.get(rule.subject)!.add(rule.id);

  // Index by domain
  if (!rulesByDomain.has(rule.domain)) {
    rulesByDomain.set(rule.domain, new Set());
  }
  rulesByDomain.get(rule.domain)!.add(rule.id);
}

/**
 * Register multiple compatibility rules.
 */
export function registerRules(rules: CompatibilityRule[]): void {
  for (const rule of rules) {
    registerRule(rule);
  }
}

/**
 * Clear all registered rules (useful for testing).
 */
export function clearRules(): void {
  ruleRegistry.clear();
  rulesBySubject.clear();
  rulesByDomain.clear();
}

/**
 * Get a rule by ID.
 */
export function getRule(id: string): CompatibilityRule | undefined {
  return ruleRegistry.get(id);
}

/**
 * Get all registered rules.
 */
export function getAllRules(): CompatibilityRule[] {
  return Array.from(ruleRegistry.values());
}

/**
 * Get rules matching filter options.
 */
export function filterRules(options: RuleFilterOptions): CompatibilityRule[] {
  let rules = getAllRules();

  // Filter by domain
  if (options.domain) {
    const domains = Array.isArray(options.domain) ? options.domain : [options.domain];
    rules = rules.filter((r) => domains.includes(r.domain));
  }

  // Filter by severity
  if (options.severity) {
    const severities = Array.isArray(options.severity)
      ? options.severity
      : [options.severity];
    rules = rules.filter((r) => severities.includes(r.severity));
  }

  // Filter by subject
  if (options.subject) {
    rules = rules.filter((r) => r.subject === options.subject);
  }

  // Filter by context
  if (options.context && options.context.length > 0) {
    rules = rules.filter((r) => {
      // If rule has no contexts, it applies everywhere
      if (!r.contexts || r.contexts.length === 0) return true;
      // Otherwise, check if any context matches
      return r.contexts.some((c) => options.context!.includes(c));
    });
  }

  return rules;
}

// ============================================================================
// Context Matching
// ============================================================================

/**
 * Check if a rule applies in the given context.
 */
function ruleAppliesInContext(
  rule: CompatibilityRule,
  context: ValidationContext
): boolean {
  // If rule has no context restrictions, it always applies
  if (!rule.contexts || rule.contexts.length === 0) {
    return true;
  }

  // Check each rule context against the validation context
  for (const ruleContext of rule.contexts) {
    // Check page context
    if (ruleContext === "email" && context.pageContext === "email") {
      return true;
    }
    if (ruleContext === "page" && context.pageContext === "page") {
      return true;
    }
    if (ruleContext === "preview" && context.pageContext === "preview") {
      return true;
    }

    // Check editor mode
    if (ruleContext === "easy-mode" && context.editorMode === "easy") {
      return true;
    }
    if (ruleContext === "standard-mode" && context.editorMode === "standard") {
      return true;
    }
    if (ruleContext === "power-mode" && context.editorMode === "power") {
      return true;
    }
  }

  return false;
}

/**
 * Get the value from context that matches a subject type.
 */
function getContextValue(subject: string, context: ValidationContext): string | undefined {
  const { type, value } = parseSubject(subject);

  switch (type) {
    case "layout":
      return context.layout;
    case "auth":
      return context.authPosition;
    case "section":
      return context.section;
    case "parent":
      return context.parentBlock;
    case "context":
      return context.pageContext;
    case "page":
      if (value === "requires-auth") {
        return context.pageRequiresAuth ? "true" : "false";
      }
      return context.pageVisibility;
    default:
      return undefined;
  }
}

/**
 * Check if a context has a left sidebar (for auth position rules).
 */
function contextHasLeftSidebar(context: ValidationContext): boolean {
  const layoutsWithSidebar = ["portal", "dashboard", "intranet"];
  return layoutsWithSidebar.includes(context.layout || "");
}

// ============================================================================
// Rule Checking
// ============================================================================

/**
 * Check a single rule against a subject and context.
 * Returns a violation if the rule is violated, null otherwise.
 */
function checkRule(
  rule: CompatibilityRule,
  subject: string,
  context: ValidationContext
): RuleViolation | null {
  // Check if rule applies to this subject
  if (rule.subject !== subject) {
    return null;
  }

  // Check if rule applies in this context
  if (!ruleAppliesInContext(rule, context)) {
    return null;
  }

  let violated = false;

  switch (rule.type) {
    case "requires": {
      // Check if required target exists
      if (rule.requires) {
        // Special case: layout:has-left-sidebar
        if (rule.requires === "layout:has-left-sidebar") {
          violated = !contextHasLeftSidebar(context);
        } else {
          const targetValue = getContextValue(rule.requires, context);
          // Rule is violated if required value is missing or false
          violated = !targetValue || targetValue === "false";
        }
      }
      break;
    }

    case "excludes": {
      // Check if excluded target exists
      if (rule.excludes) {
        const { type, value } = parseSubject(rule.excludes);

        // For parent block checks
        if (type === "parent") {
          const parentType = context.parentBlock;
          violated = parentType === value;
        } else {
          const targetValue = getContextValue(rule.excludes, context);
          violated = targetValue === value || targetValue === "true";
        }
      }
      break;
    }

    case "restricts": {
      // Check if subject value is in allowed list
      // This is handled by getAllowed() instead of validate()
      violated = false;
      break;
    }

    case "suggests": {
      // Soft recommendation - check if suggested target exists
      if (rule.suggests) {
        const targetValue = getContextValue(rule.suggests, context);
        // Rule is "violated" (shows warning) if suggested value is missing
        violated = !targetValue || targetValue === "false";
      }
      break;
    }
  }

  if (violated) {
    return {
      ruleId: rule.id,
      domain: rule.domain,
      severity: rule.severity,
      message: rule.message,
      fixAction: rule.fixAction,
      fixTarget: rule.fixTarget,
      subject: rule.subject,
    };
  }

  return null;
}

// ============================================================================
// Main Validation API
// ============================================================================

/**
 * Validate a subject in the given context.
 * Returns validation result with errors, warnings, and info.
 *
 * @param subject - Subject to validate (e.g., "auth:bottom-left", "block:columns")
 * @param context - Validation context
 * @returns Validation result
 */
export function validate(
  subject: string,
  context: ValidationContext
): ValidationResult {
  const errors: RuleViolation[] = [];
  const warnings: RuleViolation[] = [];
  const info: RuleViolation[] = [];

  // Get all rules for this subject
  const ruleIds = rulesBySubject.get(subject);
  if (!ruleIds) {
    return EMPTY_VALIDATION_RESULT;
  }

  // Check each rule
  for (const ruleId of ruleIds) {
    const rule = ruleRegistry.get(ruleId);
    if (!rule) continue;

    const violation = checkRule(rule, subject, context);
    if (violation) {
      switch (violation.severity) {
        case "error":
          errors.push(violation);
          break;
        case "warning":
          warnings.push(violation);
          break;
        case "info":
          info.push(violation);
          break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
  };
}

/**
 * Validate multiple subjects at once.
 */
export function validateMultiple(
  subjects: string[],
  context: ValidationContext
): ValidationResult {
  const combined: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: [],
  };

  for (const subject of subjects) {
    const result = validate(subject, context);
    combined.errors.push(...result.errors);
    combined.warnings.push(...result.warnings);
    combined.info.push(...result.info);
    if (!result.valid) {
      combined.valid = false;
    }
  }

  return combined;
}

// ============================================================================
// Allowed Values API
// ============================================================================

/**
 * Get allowed values for a category in the given context.
 * Uses "restricts" rules to filter options.
 *
 * @param category - Category to check (e.g., "blocks", "auth-positions")
 * @param allValues - All possible values
 * @param context - Validation context
 * @returns Filtered list of allowed values
 */
export function getAllowed(
  category: string,
  allValues: string[],
  context: ValidationContext
): string[] {
  // Find restricts rules that apply to this context
  const pageCtx = context.pageContext || "page";
  const contextSubject = "context:" + pageCtx;
  const sectionSubject = context.section ? "section:" + context.section : null;

  // Get rules that restrict this category
  const applicableRules: CompatibilityRule[] = [];

  // Check context-based restrictions (e.g., email context)
  const contextRuleIds = rulesBySubject.get(contextSubject);
  if (contextRuleIds) {
    for (const ruleId of contextRuleIds) {
      const rule = ruleRegistry.get(ruleId);
      if (rule && rule.type === "restricts" && rule.allows) {
        applicableRules.push(rule);
      }
    }
  }

  // Check section-based restrictions
  if (sectionSubject) {
    const sectionRuleIds = rulesBySubject.get(sectionSubject);
    if (sectionRuleIds) {
      for (const ruleId of sectionRuleIds) {
        const rule = ruleRegistry.get(ruleId);
        if (rule && rule.type === "restricts" && rule.allows) {
          applicableRules.push(rule);
        }
      }
    }
  }

  // If no restricts rules apply, all values are allowed
  if (applicableRules.length === 0) {
    return allValues;
  }

  // Filter to values allowed by ALL applicable restricts rules
  return allValues.filter((value) => {
    for (const rule of applicableRules) {
      if (!ruleAppliesInContext(rule, context)) continue;
      const prefixedValue = category + ":" + value;
      if (!rule.allows!.includes(prefixedValue) && !rule.allows!.includes(value)) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Check if a specific value is allowed in the context.
 */
export function isAllowed(
  value: string,
  context: ValidationContext
): { allowed: boolean; reason?: string } {
  const result = validate(value, context);

  if (!result.valid) {
    return {
      allowed: false,
      reason: result.errors[0]?.message,
    };
  }

  return { allowed: true };
}

// ============================================================================
// Change Validation API
// ============================================================================

/**
 * Check if changing from one context to another would break anything.
 * Returns blockers (errors) and automatic adjustments that would be made.
 *
 * @param from - Current context
 * @param to - Target context
 * @returns Change validation result
 */
export function validateChange(
  from: ValidationContext,
  to: ValidationContext
): ChangeValidationResult {
  const blockers: RuleViolation[] = [];
  const adjustments: Adjustment[] = [];

  // Check if layout change affects auth position
  if (from.layout !== to.layout && from.authPosition) {
    const authSubject = "auth:" + from.authPosition;
    const authResult = validate(authSubject, to);

    if (!authResult.valid) {
      // Check if we can auto-adjust
      const rule = authResult.errors[0];
      if (rule?.fixTarget) {
        adjustments.push({
          target: "authPosition",
          from: from.authPosition || "",
          to: rule.fixTarget.replace("auth:", ""),
          reason: rule.message,
        });
      } else {
        blockers.push(...authResult.errors);
      }
    }
  }

  return {
    valid: blockers.length === 0,
    blockers,
    adjustments,
  };
}

// ============================================================================
// Domain-Specific Helpers
// ============================================================================

/**
 * Check layout + auth compatibility specifically.
 */
export function checkLayoutAuthCompatibility(
  layout: string,
  authPosition: string
): ValidationResult {
  return validate("auth:" + authPosition, { layout });
}

/**
 * Check section + block compatibility.
 */
export function checkSectionBlockCompatibility(
  section: string,
  blockType: string,
  context?: Partial<ValidationContext>
): ValidationResult {
  return validate("block:" + blockType, {
    section,
    ...context,
  });
}

/**
 * Check if block type is allowed in email context.
 */
export function isBlockAllowedInEmail(blockType: string): boolean {
  const result = validate("block:" + blockType, { pageContext: "email" });
  return result.valid;
}

/**
 * Get all blocks allowed in email context.
 */
export function getEmailAllowedBlocks(allBlockTypes: string[]): string[] {
  return getAllowed("block", allBlockTypes, { pageContext: "email" });
}
