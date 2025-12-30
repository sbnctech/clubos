/**
 * Compatibility Rules Index
 *
 * Central registration of all compatibility rules.
 *
 * @see docs/design/COMPATIBILITY_SYSTEM.md
 */

import type { CompatibilityRule } from "../types";
import { layoutAuthRules } from "./layoutAuth";
import { sectionBlockRules } from "./sectionBlock";
import { blockNestingRules } from "./blockNesting";
import { emailContextRules } from "./emailContext";

/**
 * All built-in compatibility rules.
 */
export const ALL_RULES: CompatibilityRule[] = [
  ...layoutAuthRules,
  ...sectionBlockRules,
  ...blockNestingRules,
  ...emailContextRules,
];

/**
 * Rules indexed by ID for quick lookup.
 */
export const RULES_BY_ID: Map<string, CompatibilityRule> = new Map(
  ALL_RULES.map((rule) => [rule.id, rule])
);

/**
 * Rules indexed by subject for validation.
 */
export const RULES_BY_SUBJECT: Map<string, CompatibilityRule[]> = new Map();
for (const rule of ALL_RULES) {
  if (!RULES_BY_SUBJECT.has(rule.subject)) {
    RULES_BY_SUBJECT.set(rule.subject, []);
  }
  RULES_BY_SUBJECT.get(rule.subject)!.push(rule);
}

/**
 * Rules indexed by domain for filtering.
 */
export const RULES_BY_DOMAIN: Map<string, CompatibilityRule[]> = new Map();
for (const rule of ALL_RULES) {
  if (!RULES_BY_DOMAIN.has(rule.domain)) {
    RULES_BY_DOMAIN.set(rule.domain, []);
  }
  RULES_BY_DOMAIN.get(rule.domain)!.push(rule);
}

// Re-export individual rule sets
export { layoutAuthRules } from "./layoutAuth";
export { sectionBlockRules } from "./sectionBlock";
export { blockNestingRules } from "./blockNesting";
export { emailContextRules } from "./emailContext";
