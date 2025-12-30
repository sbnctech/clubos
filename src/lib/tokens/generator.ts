/**
 * Token-to-CSS Generator
 *
 * Converts design tokens to CSS custom properties.
 * Outputs can be used in stylesheets or injected at runtime.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 *
 * @see docs/projects/PAGE_PRESENTATION_SYSTEM.md
 */

import type {
  TokenSet,
  TokenCategory,
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  ShapeTokens,
  AnimationTokens,
  PartialTokenSet,
} from "./schema";
import { defaultTokenSet } from "./defaults";

// ============================================================================
// CSS Variable Name Mapping
// ============================================================================

/**
 * Convert camelCase token key to kebab-case CSS variable name.
 * Example: primaryHover -> primary-hover
 */
function toKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Generate CSS variable name from category and token key.
 * Format: --token-{category}-{key}
 * Example: --token-color-primary, --token-spacing-space-4
 */
function toCssVariableName(category: string, key: string): string {
  return `--token-${toKebabCase(category)}-${toKebabCase(key)}`;
}

// ============================================================================
// Token Category Generators
// ============================================================================

/**
 * Generate CSS variables for a single token category.
 */
function generateCategoryVariables<T extends Record<string, string>>(
  category: string,
  tokens: T
): Map<string, string> {
  const variables = new Map<string, string>();

  for (const [key, value] of Object.entries(tokens)) {
    const varName = toCssVariableName(category, key);
    variables.set(varName, value);
  }

  return variables;
}

/**
 * Generate all CSS variables from a token set.
 */
export function generateCssVariables(tokens: TokenSet): Map<string, string> {
  const variables = new Map<string, string>();

  // Color tokens
  for (const [name, value] of generateCategoryVariables("color", tokens.color)) {
    variables.set(name, value);
  }

  // Typography tokens
  for (const [name, value] of generateCategoryVariables(
    "typography",
    tokens.typography
  )) {
    variables.set(name, value);
  }

  // Spacing tokens
  for (const [name, value] of generateCategoryVariables(
    "spacing",
    tokens.spacing
  )) {
    variables.set(name, value);
  }

  // Shape tokens
  for (const [name, value] of generateCategoryVariables("shape", tokens.shape)) {
    variables.set(name, value);
  }

  // Animation tokens
  for (const [name, value] of generateCategoryVariables(
    "animation",
    tokens.animation
  )) {
    variables.set(name, value);
  }

  return variables;
}

// ============================================================================
// CSS Output Generators
// ============================================================================

/**
 * Generate CSS rule text with all token variables.
 * Outputs a :root block by default.
 *
 * @param tokens - Token set to convert
 * @param selector - CSS selector (default: ':root')
 * @returns CSS rule string
 */
export function generateCssRuleText(
  tokens: TokenSet,
  selector: string = ":root"
): string {
  const variables = generateCssVariables(tokens);
  const lines: string[] = [];

  lines.push(`${selector} {`);

  for (const [name, value] of variables) {
    lines.push(`  ${name}: ${value};`);
  }

  lines.push("}");

  return lines.join("\n");
}

/**
 * Generate CSS text with organized sections.
 *
 * @param tokens - Token set to convert
 * @returns CSS text with comments and sections
 */
export function generateCssText(tokens: TokenSet): string {
  const sections: string[] = [];

  sections.push("/* ==========================================================================");
  sections.push("   Design Tokens - Generated CSS Custom Properties");
  sections.push("   ");
  sections.push("   These variables are auto-generated from the token system.");
  sections.push("   Do not edit directly - modify the token configuration instead.");
  sections.push("   ========================================================================== */");
  sections.push("");

  sections.push(":root {");

  // Color tokens
  sections.push("  /* Color Tokens */");
  for (const [key, value] of Object.entries(tokens.color)) {
    sections.push(`  ${toCssVariableName("color", key)}: ${value};`);
  }
  sections.push("");

  // Typography tokens
  sections.push("  /* Typography Tokens */");
  for (const [key, value] of Object.entries(tokens.typography)) {
    sections.push(`  ${toCssVariableName("typography", key)}: ${value};`);
  }
  sections.push("");

  // Spacing tokens
  sections.push("  /* Spacing Tokens */");
  for (const [key, value] of Object.entries(tokens.spacing)) {
    sections.push(`  ${toCssVariableName("spacing", key)}: ${value};`);
  }
  sections.push("");

  // Shape tokens
  sections.push("  /* Shape Tokens */");
  for (const [key, value] of Object.entries(tokens.shape)) {
    sections.push(`  ${toCssVariableName("shape", key)}: ${value};`);
  }
  sections.push("");

  // Animation tokens
  sections.push("  /* Animation Tokens */");
  for (const [key, value] of Object.entries(tokens.animation)) {
    sections.push(`  ${toCssVariableName("animation", key)}: ${value};`);
  }

  sections.push("}");

  return sections.join("\n");
}

/**
 * Generate inline style object for React components.
 * Returns CSS variable definitions as a style object.
 */
export function generateStyleObject(
  tokens: TokenSet
): Record<string, string> {
  const variables = generateCssVariables(tokens);
  const style: Record<string, string> = {};

  for (const [name, value] of variables) {
    style[name] = value;
  }

  return style;
}

// ============================================================================
// Token Merging
// ============================================================================

/**
 * Merge a partial token set with defaults.
 * Only overrides specified values.
 *
 * @param overrides - Partial token set with overrides
 * @param base - Base token set (defaults to defaultTokenSet)
 * @returns Complete merged token set
 */
export function mergeTokens(
  overrides: PartialTokenSet,
  base: TokenSet = defaultTokenSet
): TokenSet {
  return {
    color: { ...base.color, ...overrides.color },
    typography: { ...base.typography, ...overrides.typography },
    spacing: { ...base.spacing, ...overrides.spacing },
    shape: { ...base.shape, ...overrides.shape },
    animation: { ...base.animation, ...overrides.animation },
  };
}

// ============================================================================
// Token Utilities
// ============================================================================

/**
 * Get a CSS variable reference for a token.
 * Returns: var(--token-color-primary)
 *
 * @param category - Token category
 * @param key - Token key
 * @param fallback - Optional fallback value
 */
export function tokenVar(
  category: TokenCategory,
  key: string,
  fallback?: string
): string {
  const varName = toCssVariableName(category, key);
  return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`;
}

/**
 * Get all token variable names for a category.
 */
export function getTokenVariableNames(
  category: TokenCategory,
  tokens: TokenSet = defaultTokenSet
): string[] {
  const categoryTokens = tokens[category];
  return Object.keys(categoryTokens).map((key) =>
    toCssVariableName(category, key)
  );
}

/**
 * Parse a CSS variable reference to extract the token name.
 * Returns null if not a valid token variable.
 *
 * @param varRef - CSS variable reference like 'var(--token-color-primary)'
 */
export function parseTokenVariable(
  varRef: string
): { category: string; key: string } | null {
  const match = varRef.match(/var\(--token-([a-z]+)-([a-z0-9-]+)(?:,\s*.+)?\)/);
  if (!match) return null;

  const [, category, key] = match;
  // Convert kebab-case back to camelCase
  const camelKey = key.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());

  return { category, key: camelKey };
}

// ============================================================================
// Dark Mode Support
// ============================================================================

/**
 * Generate CSS for dark mode tokens.
 * Uses prefers-color-scheme media query.
 *
 * @param darkTokens - Token set for dark mode
 * @returns CSS text with dark mode rule
 */
export function generateDarkModeCSS(darkTokens: TokenSet): string {
  const sections: string[] = [];

  sections.push("@media (prefers-color-scheme: dark) {");
  sections.push("  :root {");

  // Only include color tokens for dark mode (others typically don't change)
  for (const [key, value] of Object.entries(darkTokens.color)) {
    sections.push(`    ${toCssVariableName("color", key)}: ${value};`);
  }

  sections.push("  }");
  sections.push("}");

  return sections.join("\n");
}

/**
 * Generate CSS for a class-based dark mode toggle.
 *
 * @param darkTokens - Token set for dark mode
 * @param className - Class name to trigger dark mode (default: 'dark')
 * @returns CSS text with dark mode class rule
 */
export function generateDarkModeClassCSS(
  darkTokens: TokenSet,
  className: string = "dark"
): string {
  const sections: string[] = [];

  sections.push(`.${className} {`);

  for (const [key, value] of Object.entries(darkTokens.color)) {
    sections.push(`  ${toCssVariableName("color", key)}: ${value};`);
  }

  sections.push("}");

  return sections.join("\n");
}

// ============================================================================
// Token Export for External Use
// ============================================================================

/**
 * Export tokens as JSON for external tools (Figma, etc.)
 */
export function exportTokensAsJSON(tokens: TokenSet): string {
  return JSON.stringify(tokens, null, 2);
}

/**
 * Export tokens in CSS-in-JS format (for styled-components, emotion, etc.)
 */
export function exportTokensAsCSSInJS(tokens: TokenSet): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};

  for (const category of Object.keys(tokens) as TokenCategory[]) {
    result[category] = {};
    for (const [key, value] of Object.entries(tokens[category])) {
      const varName = toCssVariableName(category, key);
      result[category][key] = `var(${varName})`;
    }
  }

  return result;
}
