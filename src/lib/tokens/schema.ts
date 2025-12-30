/**
 * Token System Schema
 *
 * Design tokens are the atomic building blocks of visual styling.
 * Aligned with Figma/CSS Variables best practices.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 *
 * @see docs/projects/PAGE_PRESENTATION_SYSTEM.md
 */

import { z } from "zod";

// ============================================================================
// Color Token Schema
// ============================================================================

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const hexColor = z.string().regex(hexColorRegex, "Must be a valid hex color");

export const colorTokensSchema = z.object({
  // Brand colors
  primary: hexColor.describe("Brand primary color"),
  primaryHover: hexColor.describe("Primary hover state"),
  secondary: hexColor.describe("Brand secondary color"),
  secondaryHover: hexColor.describe("Secondary hover state"),
  accent: hexColor.describe("Accent for highlights and CTAs"),
  accentHover: hexColor.describe("Accent hover state"),

  // Surface colors
  background: hexColor.describe("Page background"),
  surface: hexColor.describe("Card/panel background"),
  surfaceHover: hexColor.describe("Surface hover state"),
  surfaceActive: hexColor.describe("Surface active/selected state"),

  // Text colors
  text: hexColor.describe("Primary text color"),
  textMuted: hexColor.describe("Secondary/muted text"),
  textInverse: hexColor.describe("Text on dark backgrounds"),

  // Border colors
  border: hexColor.describe("Default border color"),
  borderHover: hexColor.describe("Border hover state"),
  borderFocus: hexColor.describe("Border focus state"),

  // Semantic colors
  success: hexColor.describe("Success/positive state"),
  successMuted: hexColor.describe("Success background"),
  warning: hexColor.describe("Warning/caution state"),
  warningMuted: hexColor.describe("Warning background"),
  error: hexColor.describe("Error/destructive state"),
  errorMuted: hexColor.describe("Error background"),
  info: hexColor.describe("Informational state"),
  infoMuted: hexColor.describe("Info background"),
});

// ============================================================================
// Typography Token Schema
// ============================================================================

export const typographyTokensSchema = z.object({
  // Font families
  fontHeading: z.string().min(1).describe("Font family for headings"),
  fontBody: z.string().min(1).describe("Font family for body text"),
  fontMono: z.string().min(1).describe("Font family for code/monospace"),

  // Font sizes (rem-based for accessibility)
  fontSizeXs: z.string().describe("Extra small text (0.75rem)"),
  fontSizeSm: z.string().describe("Small text (0.875rem)"),
  fontSizeBase: z.string().describe("Base text (1rem)"),
  fontSizeLg: z.string().describe("Large text (1.125rem)"),
  fontSizeXl: z.string().describe("Extra large text (1.25rem)"),
  fontSize2xl: z.string().describe("2x large text (1.5rem)"),
  fontSize3xl: z.string().describe("3x large text (1.875rem)"),
  fontSize4xl: z.string().describe("4x large text (2.25rem)"),
  fontSize5xl: z.string().describe("5x large text (3rem)"),

  // Font weights
  fontWeightNormal: z.string().describe("Normal weight (400)"),
  fontWeightMedium: z.string().describe("Medium weight (500)"),
  fontWeightSemibold: z.string().describe("Semibold weight (600)"),
  fontWeightBold: z.string().describe("Bold weight (700)"),

  // Line heights
  lineHeightTight: z.string().describe("Tight line height (1.25)"),
  lineHeightBase: z.string().describe("Base line height (1.5)"),
  lineHeightRelaxed: z.string().describe("Relaxed line height (1.75)"),

  // Letter spacing
  letterSpacingTight: z.string().describe("Tight letter spacing"),
  letterSpacingNormal: z.string().describe("Normal letter spacing"),
  letterSpacingWide: z.string().describe("Wide letter spacing"),
});

// ============================================================================
// Spacing Token Schema (4px base grid)
// ============================================================================

export const spacingTokensSchema = z.object({
  space0: z.string().describe("0px"),
  space1: z.string().describe("4px (0.25rem)"),
  space2: z.string().describe("8px (0.5rem)"),
  space3: z.string().describe("12px (0.75rem)"),
  space4: z.string().describe("16px (1rem)"),
  space5: z.string().describe("20px (1.25rem)"),
  space6: z.string().describe("24px (1.5rem)"),
  space8: z.string().describe("32px (2rem)"),
  space10: z.string().describe("40px (2.5rem)"),
  space12: z.string().describe("48px (3rem)"),
  space16: z.string().describe("64px (4rem)"),
  space20: z.string().describe("80px (5rem)"),
  space24: z.string().describe("96px (6rem)"),
});

// ============================================================================
// Shape Token Schema (border radius, shadows)
// ============================================================================

export const shapeTokensSchema = z.object({
  // Border radius
  radiusNone: z.string().describe("0px - no rounding"),
  radiusSm: z.string().describe("4px - subtle rounding"),
  radiusMd: z.string().describe("8px - standard rounding"),
  radiusLg: z.string().describe("12px - prominent rounding"),
  radiusXl: z.string().describe("16px - large rounding"),
  radius2xl: z.string().describe("24px - extra large rounding"),
  radiusFull: z.string().describe("9999px - pill shape"),

  // Shadows
  shadowNone: z.string().describe("No shadow"),
  shadowSm: z.string().describe("Subtle shadow for raised elements"),
  shadowMd: z.string().describe("Medium shadow for cards"),
  shadowLg: z.string().describe("Large shadow for modals/popovers"),
  shadowXl: z.string().describe("Extra large shadow for prominent elements"),

  // Border widths
  borderWidthNone: z.string().describe("0px"),
  borderWidthThin: z.string().describe("1px"),
  borderWidthMedium: z.string().describe("2px"),
  borderWidthThick: z.string().describe("4px"),
});

// ============================================================================
// Animation Token Schema
// ============================================================================

export const animationTokensSchema = z.object({
  // Durations
  durationFast: z.string().describe("Fast animation (100ms)"),
  durationBase: z.string().describe("Base animation (200ms)"),
  durationSlow: z.string().describe("Slow animation (300ms)"),
  durationSlower: z.string().describe("Slower animation (500ms)"),

  // Easing
  easeDefault: z.string().describe("Default easing curve"),
  easeIn: z.string().describe("Ease-in curve"),
  easeOut: z.string().describe("Ease-out curve"),
  easeInOut: z.string().describe("Ease-in-out curve"),
});

// ============================================================================
// Complete Token Set Schema
// ============================================================================

export const tokenSetSchema = z.object({
  color: colorTokensSchema,
  typography: typographyTokensSchema,
  spacing: spacingTokensSchema,
  shape: shapeTokensSchema,
  animation: animationTokensSchema,
});

// ============================================================================
// Type Exports
// ============================================================================

export type ColorTokens = z.infer<typeof colorTokensSchema>;
export type TypographyTokens = z.infer<typeof typographyTokensSchema>;
export type SpacingTokens = z.infer<typeof spacingTokensSchema>;
export type ShapeTokens = z.infer<typeof shapeTokensSchema>;
export type AnimationTokens = z.infer<typeof animationTokensSchema>;
export type TokenSet = z.infer<typeof tokenSetSchema>;

// Token category keys for iteration
export type TokenCategory = keyof TokenSet;

// Individual token key types
export type ColorTokenKey = keyof ColorTokens;
export type TypographyTokenKey = keyof TypographyTokens;
export type SpacingTokenKey = keyof SpacingTokens;
export type ShapeTokenKey = keyof ShapeTokens;
export type AnimationTokenKey = keyof AnimationTokens;

// ============================================================================
// Validation Functions
// ============================================================================

export function validateTokenSet(tokens: unknown): TokenSet {
  return tokenSetSchema.parse(tokens);
}

export function isValidTokenSet(tokens: unknown): tokens is TokenSet {
  return tokenSetSchema.safeParse(tokens).success;
}

export function validateColorTokens(colors: unknown): ColorTokens {
  return colorTokensSchema.parse(colors);
}

export function isValidHexColor(color: string): boolean {
  return hexColorRegex.test(color);
}

// ============================================================================
// Partial Token Set (for overrides)
// ============================================================================

export const partialTokenSetSchema = z.object({
  color: colorTokensSchema.partial().optional(),
  typography: typographyTokensSchema.partial().optional(),
  spacing: spacingTokensSchema.partial().optional(),
  shape: shapeTokensSchema.partial().optional(),
  animation: animationTokensSchema.partial().optional(),
});

export type PartialTokenSet = z.infer<typeof partialTokenSetSchema>;
