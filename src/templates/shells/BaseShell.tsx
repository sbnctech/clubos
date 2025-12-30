/**
 * Base Shell Component
 *
 * Foundation for all layout shells. Provides CSS grid structure based on
 * layout configuration, with slots for navigation, content, and sidebars.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import { useMemo } from "react";
import type { ReactNode, CSSProperties } from "react";
import type { ShellProps, SectionContentMap } from "./types";
import type { SectionConfig, LayoutConfig } from "@/lib/layouts/schema";
import { ShellProvider } from "./ShellContext";

// ============================================================================
// Base Shell Props
// ============================================================================

export interface BaseShellProps extends ShellProps {
  /** Header element (logo + nav) */
  header?: ReactNode;

  /** Footer element */
  footer?: ReactNode;

  /** Left sidebar element */
  leftSidebar?: ReactNode;

  /** Right sidebar element */
  rightSidebar?: ReactNode;

  /** Main content element */
  main?: ReactNode;

  /** Hero section element */
  hero?: ReactNode;

  /** Custom CSS properties */
  style?: CSSProperties;
}

// ============================================================================
// Component
// ============================================================================

export function BaseShell({
  layout,
  authPosition,
  children,
  sections,
  className,
  isPreview = false,
  isAuthenticated = false,
  user,
  navItems = [],
  onLogin: _onLogin,
  onLogout: _onLogout,
  onNavigate: _onNavigate,
  header,
  footer,
  leftSidebar,
  rightSidebar,
  main,
  hero,
  style,
}: BaseShellProps) {
  // Generate CSS grid styles from layout config
  const gridStyles = useMemo<CSSProperties>(
    () => ({
      display: "grid",
      gridTemplateAreas: layout.gridTemplate,
      gridTemplateColumns: layout.gridColumns,
      gridTemplateRows: layout.gridRows || "auto 1fr auto",
      minHeight: "100vh",
      ...style,
    }),
    [layout.gridTemplate, layout.gridColumns, layout.gridRows, style]
  );

  // Build section content map
  const sectionContent = useMemo<SectionContentMap>(() => {
    const content: SectionContentMap = {};

    // Explicit section props take precedence
    if (header) content.header = header;
    if (footer) content.footer = footer;
    if (leftSidebar) content["nav-left"] = leftSidebar;
    if (rightSidebar) content.panel = rightSidebar;
    if (main) content.main = main;
    if (hero) content.hero = hero;

    // Merge with sections prop
    if (sections) {
      Object.assign(content, sections);
    }

    return content;
  }, [header, footer, leftSidebar, rightSidebar, main, hero, sections]);

  // Render a section element
  const renderSection = (section: SectionConfig) => {
    const content = sectionContent[section.id];

    // Skip empty optional sections
    if (!content && section.isOptional) {
      return null;
    }

    const sectionStyles: CSSProperties = {
      gridArea: section.gridArea,
      minWidth: section.minWidth,
      maxWidth: section.maxWidth,
    };

    return (
      <div
        key={section.id}
        data-section={section.id}
        data-section-type={section.type}
        className={`shell-section shell-section-${section.type}`}
        style={sectionStyles}
      >
        {content}
      </div>
    );
  };

  return (
    <ShellProvider
      layout={layout}
      authPosition={authPosition}
      isPreview={isPreview}
      isAuthenticated={isAuthenticated}
      user={user}
      navItems={navItems}
    >
      <div
        className={`shell shell-${layout.id} ${className || ""}`}
        style={gridStyles}
        data-layout={layout.id}
        data-preview={isPreview || undefined}
      >
        {layout.sections.map(renderSection)}
        {children}
      </div>
    </ShellProvider>
  );
}

// ============================================================================
// Section Component
// ============================================================================

export interface ShellSectionProps {
  /** Section ID (must match layout section) */
  sectionId: string;

  /** Content */
  children: ReactNode;

  /** Custom className */
  className?: string;

  /** Custom styles */
  style?: CSSProperties;
}

/**
 * Helper component to render content in a specific section.
 * Use within BaseShell children to target a grid area.
 */
export function ShellSection({
  sectionId,
  children,
  className,
  style,
}: ShellSectionProps) {
  return (
    <div
      className={`shell-section-content ${className || ""}`}
      style={{ gridArea: sectionId, ...style }}
      data-section-content={sectionId}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate responsive grid CSS for a layout.
 */
export function generateShellCSS(layout: LayoutConfig): string {
  const css = `
.shell-${layout.id} {
  display: grid;
  grid-template-areas: ${layout.gridTemplate};
  grid-template-columns: ${layout.gridColumns};
  ${layout.gridRows ? `grid-template-rows: ${layout.gridRows};` : ""}
  min-height: 100vh;
}

${
  layout.mobileGridTemplate
    ? `
@media (max-width: ${layout.mobileBreakpoint || "768px"}) {
  .shell-${layout.id} {
    grid-template-areas: ${layout.mobileGridTemplate};
    grid-template-columns: 1fr;
  }
}
`
    : ""
}
`.trim();

  return css;
}

/**
 * Get section by ID from layout.
 */
export function getSection(
  layout: LayoutConfig,
  sectionId: string
): SectionConfig | undefined {
  return layout.sections.find((s) => s.id === sectionId);
}

/**
 * Get sections by type from layout.
 */
export function getSectionsByType(
  layout: LayoutConfig,
  type: SectionConfig["type"]
): SectionConfig[] {
  return layout.sections.filter((s) => s.type === type);
}
