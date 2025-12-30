/**
 * Token System
 *
 * Design tokens are the atomic building blocks of visual styling.
 * This module provides schemas, defaults, and utilities for managing
 * design tokens and converting them to CSS custom properties.
 *
 * Copyright © 2025 Murmurant, Inc.
 * @see docs/projects/PAGE_PRESENTATION_SYSTEM.md
 */

// Schema and types
export {
  // Schemas
  tokenSetSchema,
  colorTokensSchema,
  typographyTokensSchema,
  spacingTokensSchema,
  shapeTokensSchema,
  animationTokensSchema,
  partialTokenSetSchema,
  // Types
  type TokenSet,
  type ColorTokens,
  type TypographyTokens,
  type SpacingTokens,
  type ShapeTokens,
  type AnimationTokens,
  type PartialTokenSet,
  type TokenCategory,
  type ColorTokenKey,
  type TypographyTokenKey,
  type SpacingTokenKey,
  type ShapeTokenKey,
  type AnimationTokenKey,
  // Validation
  validateTokenSet,
  isValidTokenSet,
  validateColorTokens,
  isValidHexColor,
} from "./schema";

// Defaults
export {
  defaultTokenSet,
  defaultColorTokens,
  defaultTypographyTokens,
  defaultSpacingTokens,
  defaultShapeTokens,
  defaultAnimationTokens,
  // Presets
  warmColorTokens,
  coolColorTokens,
  neutralColorTokens,
} from "./defaults";

// Generator
export {
  generateCssVariables,
  generateCssRuleText,
  generateCssText,
  generateStyleObject,
  mergeTokens,
  tokenVar,
  getTokenVariableNames,
  parseTokenVariable,
  generateDarkModeCSS,
  generateDarkModeClassCSS,
  exportTokensAsJSON,
  exportTokensAsCSSInJS,
} from "./generator";
