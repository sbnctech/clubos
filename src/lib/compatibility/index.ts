/**
 * Compatibility System
 *
 * Unified system for enforcing valid combinations across layouts, blocks,
 * sections, and contexts.
 *
 * Charter: P4 (no hidden rules), P6 (human-first UI), P8 (stable contracts)
 *
 * @see docs/design/COMPATIBILITY_SYSTEM.md
 */

// Types
export {
  // Schemas
  ruleTypeSchema,
  severitySchema,
  ruleDomainSchema,
  compatibilityRuleSchema,
  validationContextSchema,
  blockCategorySchema,
  // Types
  type RuleType,
  type Severity,
  type RuleDomain,
  type CompatibilityRule,
  type ValidationContext,
  type ValidationResult,
  type ChangeValidationResult,
  type RuleViolation,
  type Adjustment,
  type RuleFilterOptions,
  type BlockCategory,
  type PageContext,
  type SubjectIdentifier,
  // Helpers
  parseSubject,
  createSubject,
  isEmailContext,
  isPreviewContext,
  // Constants
  EMPTY_VALIDATION_RESULT,
  EMPTY_CHANGE_RESULT,
} from "./types";

// Engine
export {
  // Registration
  registerRule,
  registerRules,
  clearRules,
  getRule,
  getAllRules,
  filterRules,
  // Validation
  validate,
  validateMultiple,
  getAllowed,
  isAllowed,
  validateChange,
  // Helpers
  checkLayoutAuthCompatibility,
  checkSectionBlockCompatibility,
  isBlockAllowedInEmail,
  getEmailAllowedBlocks,
} from "./engine";

// Rules
export {
  ALL_RULES,
  RULES_BY_ID,
  RULES_BY_SUBJECT,
  RULES_BY_DOMAIN,
  layoutAuthRules,
  sectionBlockRules,
  blockNestingRules,
  emailContextRules,
} from "./rules";

// ============================================================================
// Initialization
// ============================================================================

import { registerRules } from "./engine";
import { ALL_RULES } from "./rules";

/**
 * Initialize the compatibility system with all built-in rules.
 * Call this once at app startup.
 */
export function initializeCompatibilitySystem(): void {
  registerRules(ALL_RULES);
}

/**
 * Auto-initialize when this module is imported.
 * This ensures rules are always registered.
 */
let initialized = false;
export function ensureInitialized(): void {
  if (!initialized) {
    initializeCompatibilitySystem();
    initialized = true;
  }
}

// Auto-initialize on import
ensureInitialized();
