/**
 * Block Nesting Compatibility Rules
 *
 * Rules governing which blocks can be nested inside other blocks.
 *
 * Charter: P4 (no hidden rules), P6 (human-first UI)
 *
 * @see docs/design/COMPATIBILITY_SYSTEM.md
 */

import type { CompatibilityRule } from "../types";

/**
 * Block nesting compatibility rules.
 *
 * Key constraints:
 * - Columns cannot be nested inside columns
 * - Accordions cannot be nested inside accordions
 * - Tabs cannot be nested inside tabs
 * - Layout blocks have nesting restrictions
 */
export const blockNestingRules: CompatibilityRule[] = [
  // ============================================================================
  // Columns Block
  // ============================================================================
  {
    id: "no-nested-columns",
    domain: "block-nesting",
    type: "excludes",
    severity: "error",
    subject: "block:columns",
    excludes: "parent:block:columns",
    message: "Columns cannot be nested inside other columns.",
    fixAction: "Use a single columns block with more columns instead",
    description: "Nested columns create layout complexity and responsive issues.",
  },

  // ============================================================================
  // Accordion Block
  // ============================================================================
  {
    id: "no-nested-accordion",
    domain: "block-nesting",
    type: "excludes",
    severity: "error",
    subject: "block:accordion",
    excludes: "parent:block:accordion",
    message: "Accordions cannot be nested inside other accordions.",
    fixAction: "Use a single accordion with more items",
    description: "Nested accordions create confusing UX.",
  },

  // ============================================================================
  // Tabs Block
  // ============================================================================
  {
    id: "no-nested-tabs",
    domain: "block-nesting",
    type: "excludes",
    severity: "error",
    subject: "block:tabs",
    excludes: "parent:block:tabs",
    message: "Tabs cannot be nested inside other tabs.",
    fixAction: "Reorganize content to avoid nested tabs",
    description: "Nested tabs create confusing navigation.",
  },

  // ============================================================================
  // Carousel Block
  // ============================================================================
  {
    id: "no-nested-carousel",
    domain: "block-nesting",
    type: "excludes",
    severity: "error",
    subject: "block:carousel",
    excludes: "parent:block:carousel",
    message: "Carousels cannot be nested inside other carousels.",
    description: "Nested carousels create conflicting swipe gestures.",
  },

  // ============================================================================
  // Gallery Block
  // ============================================================================
  {
    id: "no-gallery-in-columns",
    domain: "block-nesting",
    type: "excludes",
    severity: "warning",
    subject: "block:gallery",
    excludes: "parent:block:columns",
    message: "Galleries work better outside of columns.",
    fixAction: "Move gallery outside the columns block",
    description: "Galleries need width to display properly.",
  },
];

export default blockNestingRules;
