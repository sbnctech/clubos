/**
 * Apply Theme to Document
 *
 * Sets CSS custom properties on document root based on theme configuration.
 *
 * Charter: P6 (human-first UI)
 */

import type { ClubTheme } from "./types";

/**
 * Applies theme values as CSS custom properties on the document root.
 * This allows components to use var(--theme-primary) etc.
 */
export function applyTheme(theme: ClubTheme): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Colors
  root.style.setProperty("--theme-primary", theme.colors.primary);
  root.style.setProperty("--theme-primary-hover", theme.colors.primaryHover);
  root.style.setProperty("--theme-secondary", theme.colors.secondary);
  root.style.setProperty("--theme-accent", theme.colors.accent);
  root.style.setProperty("--theme-background", theme.colors.background);
  root.style.setProperty("--theme-surface", theme.colors.surface);
  root.style.setProperty("--theme-text-primary", theme.colors.textPrimary);
  root.style.setProperty("--theme-text-secondary", theme.colors.textSecondary);
  root.style.setProperty("--theme-text-muted", theme.colors.textMuted);
  root.style.setProperty("--theme-border", theme.colors.border);
  root.style.setProperty("--theme-error", theme.colors.error);
  root.style.setProperty("--theme-warning", theme.colors.warning);
  root.style.setProperty("--theme-success", theme.colors.success);

  // Typography
  root.style.setProperty("--theme-font-heading", theme.typography.fontHeading);
  root.style.setProperty("--theme-font-body", theme.typography.fontBody);
  root.style.setProperty("--theme-font-mono", theme.typography.fontMono);

  // Shape
  root.style.setProperty("--theme-border-radius", theme.shape.borderRadius);
}

/**
 * Removes all theme CSS custom properties from document root.
 */
export function clearTheme(): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const themeProps = [
    "--theme-primary",
    "--theme-primary-hover",
    "--theme-secondary",
    "--theme-accent",
    "--theme-background",
    "--theme-surface",
    "--theme-text-primary",
    "--theme-text-secondary",
    "--theme-text-muted",
    "--theme-border",
    "--theme-error",
    "--theme-warning",
    "--theme-success",
    "--theme-font-heading",
    "--theme-font-body",
    "--theme-font-mono",
    "--theme-border-radius",
  ];

  themeProps.forEach((prop) => root.style.removeProperty(prop));
}
