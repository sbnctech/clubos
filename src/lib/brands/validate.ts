/**
 * Brand Validation Utilities
 *
 * Functions for validating brand configurations including
 * schema validation, accessibility checks, and completeness scoring.
 *
 * Charter: P6 (human-first UI), P4 (no hidden rules)
 */

import type { ClubBrand } from "./types";
import { clubBrandSchema } from "./schema";

// ============================================================================
// Schema Validation
// ============================================================================

/**
 * Safely validate a brand configuration against the schema
 * Returns errors instead of throwing
 */
export function safeParseBrand(brand: unknown): {
  valid: boolean;
  errors: string[];
} {
  const result = clubBrandSchema.safeParse(brand);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`),
  };
}

// ============================================================================
// Color Accessibility
// ============================================================================

/**
 * Parse a hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (!short) return null;
    return {
      r: parseInt(short[1] + short[1], 16),
      g: parseInt(short[2] + short[2], 16),
      b: parseInt(short[3] + short[3], 16),
    };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Calculate relative luminance per WCAG 2.1
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Check if colors meet WCAG accessibility contrast requirements
 */
export function checkColorContrast(
  foreground: string,
  background: string
): { ratio: number; passesAA: boolean; passesAAA: boolean } {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) {
    return { ratio: 0, passesAA: false, passesAAA: false };
  }

  const l1 = getRelativeLuminance(fg.r, fg.g, fg.b);
  const l2 = getRelativeLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
  };
}

// ============================================================================
// Logo Validation
// ============================================================================

/**
 * Validate logo dimensions for proper display
 */
export function validateLogoDimensions(
  width: number,
  height: number
): { valid: boolean; message?: string } {
  if (width < 100) {
    return { valid: false, message: "Logo too narrow (min 100px)" };
  }
  if (height < 30) {
    return { valid: false, message: "Logo too short (min 30px)" };
  }
  if (width > 400) {
    return { valid: false, message: "Logo too wide (max 400px)" };
  }
  if (height > 200) {
    return { valid: false, message: "Logo too tall (max 200px)" };
  }
  return { valid: true };
}

// ============================================================================
// Completeness Scoring
// ============================================================================

/**
 * Check brand completeness and return score with missing fields
 */
export function getBrandCompleteness(brand: ClubBrand): {
  percent: number;
  missing: string[];
} {
  const missing: string[] = [];

  const optionalChecks: Array<{ path: string; check: () => boolean }> = [
    {
      path: "identity.logo.alt",
      check: () => Boolean(brand.identity?.logo?.alt),
    },
    {
      path: "communication.socialLinks.facebook",
      check: () => Boolean(brand.communication?.socialLinks?.facebook),
    },
    {
      path: "communication.socialLinks.instagram",
      check: () => Boolean(brand.communication?.socialLinks?.instagram),
    },
    {
      path: "communication.socialLinks.twitter",
      check: () => Boolean(brand.communication?.socialLinks?.twitter),
    },
    {
      path: "communication.socialLinks.linkedin",
      check: () => Boolean(brand.communication?.socialLinks?.linkedin),
    },
    {
      path: "chatbot.suggestedPrompts (3+)",
      check: () => (brand.chatbot?.suggestedPrompts?.length ?? 0) >= 3,
    },
    {
      path: "voice.greeting",
      check: () =>
        Boolean(brand.voice?.greeting && brand.voice.greeting.length > 5),
    },
    {
      path: "approvedBy",
      check: () => Boolean(brand.approvedBy && brand.approvedBy.length > 0),
    },
  ];

  for (const { path, check } of optionalChecks) {
    if (!check()) {
      missing.push(path);
    }
  }

  const total = optionalChecks.length;
  const completed = total - missing.length;
  const percent = Math.round((completed / total) * 100);

  return { percent, missing };
}

// ============================================================================
// Brand Audit
// ============================================================================

/**
 * Run a full audit on a brand configuration
 */
export function auditBrand(brand: ClubBrand): {
  schemaValid: boolean;
  schemaErrors: string[];
  colorContrast: {
    primaryOnBackground: { ratio: number; passesAA: boolean };
  };
  logoValid: boolean;
  logoMessage?: string;
  completeness: { percent: number; missing: string[] };
} {
  const schemaResult = safeParseBrand(brand);

  const primaryOnBackground = checkColorContrast(
    brand.identity?.colors?.primary ?? "#000000",
    "#FFFFFF"
  );

  const logoResult = validateLogoDimensions(
    brand.identity?.logo?.width ?? 0,
    brand.identity?.logo?.height ?? 0
  );

  const completeness = getBrandCompleteness(brand);

  return {
    schemaValid: schemaResult.valid,
    schemaErrors: schemaResult.errors,
    colorContrast: {
      primaryOnBackground: {
        ratio: primaryOnBackground.ratio,
        passesAA: primaryOnBackground.passesAA,
      },
    },
    logoValid: logoResult.valid,
    logoMessage: logoResult.message,
    completeness,
  };
}
