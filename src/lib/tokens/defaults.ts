/**
 * Default Token Values
 *
 * Default design tokens for the Murmurant platform.
 * Based on a modern, accessible color palette with
 * 4px spacing grid and consistent typography.
 *
 * Charter: P6 (human-first UI)
 *
 * @see docs/projects/PAGE_PRESENTATION_SYSTEM.md
 */

import type {
  TokenSet,
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  ShapeTokens,
  AnimationTokens,
} from "./schema";

// ============================================================================
// Default Color Tokens
// ============================================================================

export const defaultColorTokens: ColorTokens = {
  // Brand colors (blue-based default)
  primary: "#1E40AF", // Blue 800
  primaryHover: "#1E3A8A", // Blue 900
  secondary: "#475569", // Slate 600
  secondaryHover: "#334155", // Slate 700
  accent: "#F59E0B", // Amber 500
  accentHover: "#D97706", // Amber 600

  // Surface colors
  background: "#FFFFFF",
  surface: "#F8FAFC", // Slate 50
  surfaceHover: "#F1F5F9", // Slate 100
  surfaceActive: "#E2E8F0", // Slate 200

  // Text colors
  text: "#0F172A", // Slate 900
  textMuted: "#64748B", // Slate 500
  textInverse: "#FFFFFF",

  // Border colors
  border: "#E2E8F0", // Slate 200
  borderHover: "#CBD5E1", // Slate 300
  borderFocus: "#1E40AF", // Primary

  // Semantic colors
  success: "#059669", // Emerald 600
  successMuted: "#D1FAE5", // Emerald 100
  warning: "#D97706", // Amber 600
  warningMuted: "#FEF3C7", // Amber 100
  error: "#DC2626", // Red 600
  errorMuted: "#FEE2E2", // Red 100
  info: "#0284C7", // Sky 600
  infoMuted: "#E0F2FE", // Sky 100
};

// ============================================================================
// Default Typography Tokens
// ============================================================================

export const defaultTypographyTokens: TypographyTokens = {
  // Font families
  fontHeading: "'Inter', system-ui, -apple-system, sans-serif",
  fontBody: "'Inter', system-ui, -apple-system, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",

  // Font sizes (rem-based for accessibility)
  fontSizeXs: "0.75rem", // 12px
  fontSizeSm: "0.875rem", // 14px
  fontSizeBase: "1rem", // 16px
  fontSizeLg: "1.125rem", // 18px
  fontSizeXl: "1.25rem", // 20px
  fontSize2xl: "1.5rem", // 24px
  fontSize3xl: "1.875rem", // 30px
  fontSize4xl: "2.25rem", // 36px
  fontSize5xl: "3rem", // 48px

  // Font weights
  fontWeightNormal: "400",
  fontWeightMedium: "500",
  fontWeightSemibold: "600",
  fontWeightBold: "700",

  // Line heights
  lineHeightTight: "1.25",
  lineHeightBase: "1.5",
  lineHeightRelaxed: "1.75",

  // Letter spacing
  letterSpacingTight: "-0.025em",
  letterSpacingNormal: "0",
  letterSpacingWide: "0.025em",
};

// ============================================================================
// Default Spacing Tokens (4px base grid)
// ============================================================================

export const defaultSpacingTokens: SpacingTokens = {
  space0: "0",
  space1: "0.25rem", // 4px
  space2: "0.5rem", // 8px
  space3: "0.75rem", // 12px
  space4: "1rem", // 16px
  space5: "1.25rem", // 20px
  space6: "1.5rem", // 24px
  space8: "2rem", // 32px
  space10: "2.5rem", // 40px
  space12: "3rem", // 48px
  space16: "4rem", // 64px
  space20: "5rem", // 80px
  space24: "6rem", // 96px
};

// ============================================================================
// Default Shape Tokens
// ============================================================================

export const defaultShapeTokens: ShapeTokens = {
  // Border radius
  radiusNone: "0",
  radiusSm: "0.25rem", // 4px
  radiusMd: "0.5rem", // 8px
  radiusLg: "0.75rem", // 12px
  radiusXl: "1rem", // 16px
  radius2xl: "1.5rem", // 24px
  radiusFull: "9999px",

  // Shadows
  shadowNone: "none",
  shadowSm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  shadowMd: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  shadowLg:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  shadowXl:
    "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",

  // Border widths
  borderWidthNone: "0",
  borderWidthThin: "1px",
  borderWidthMedium: "2px",
  borderWidthThick: "4px",
};

// ============================================================================
// Default Animation Tokens
// ============================================================================

export const defaultAnimationTokens: AnimationTokens = {
  // Durations
  durationFast: "100ms",
  durationBase: "200ms",
  durationSlow: "300ms",
  durationSlower: "500ms",

  // Easing
  easeDefault: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
};

// ============================================================================
// Complete Default Token Set
// ============================================================================

export const defaultTokenSet: TokenSet = {
  color: defaultColorTokens,
  typography: defaultTypographyTokens,
  spacing: defaultSpacingTokens,
  shape: defaultShapeTokens,
  animation: defaultAnimationTokens,
};

// ============================================================================
// Token Presets (Theme Variations)
// ============================================================================

/**
 * Warm color preset for friendly, welcoming clubs
 */
export const warmColorTokens: ColorTokens = {
  ...defaultColorTokens,
  primary: "#B45309", // Amber 700
  primaryHover: "#92400E", // Amber 800
  secondary: "#78716C", // Stone 500
  secondaryHover: "#57534E", // Stone 600
  accent: "#0D9488", // Teal 600
  accentHover: "#0F766E", // Teal 700
  background: "#FFFBEB", // Amber 50
  surface: "#FFFFFF",
  surfaceHover: "#FEF3C7", // Amber 100
};

/**
 * Cool color preset for professional organizations
 */
export const coolColorTokens: ColorTokens = {
  ...defaultColorTokens,
  primary: "#0F766E", // Teal 700
  primaryHover: "#115E59", // Teal 800
  secondary: "#64748B", // Slate 500
  secondaryHover: "#475569", // Slate 600
  accent: "#7C3AED", // Violet 600
  accentHover: "#6D28D9", // Violet 700
  background: "#F0FDFA", // Teal 50
  surface: "#FFFFFF",
  surfaceHover: "#CCFBF1", // Teal 100
};

/**
 * Neutral color preset for minimal designs
 */
export const neutralColorTokens: ColorTokens = {
  ...defaultColorTokens,
  primary: "#18181B", // Zinc 900
  primaryHover: "#27272A", // Zinc 800
  secondary: "#71717A", // Zinc 500
  secondaryHover: "#52525B", // Zinc 600
  accent: "#2563EB", // Blue 600
  accentHover: "#1D4ED8", // Blue 700
  background: "#FAFAFA", // Zinc 50
  surface: "#FFFFFF",
  surfaceHover: "#F4F4F5", // Zinc 100
};
