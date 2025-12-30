/**
 * Classic Shell
 *
 * Simple top-nav layout with hero, main content, and footer.
 * This is WA-compatible and the most common layout pattern.
 *
 * Structure:
 * ┌─────────────────────────────┐
 * │          Header             │
 * ├─────────────────────────────┤
 * │           Hero              │
 * ├─────────────────────────────┤
 * │                             │
 * │           Main              │
 * │                             │
 * ├─────────────────────────────┤
 * │          Footer             │
 * └─────────────────────────────┘
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import type { ReactNode, CSSProperties } from "react";
import type { ShellProps } from "./types";
import { ShellProvider, useShell } from "./ShellContext";
import { getLayout } from "@/lib/layouts/registry";

// ============================================================================
// Classic Shell Props
// ============================================================================

export interface ClassicShellProps extends Omit<ShellProps, "layout"> {
  /** Header content (logo + nav) */
  header?: ReactNode;

  /** Hero section content (optional) */
  hero?: ReactNode;

  /** Main content */
  main?: ReactNode;

  /** Footer content */
  footer?: ReactNode;

  /** Maximum width for main content */
  maxContentWidth?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ClassicShell({
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
  hero,
  main,
  footer,
  maxContentWidth = "1200px",
}: ClassicShellProps) {
  const layout = getLayout("classic");

  // Grid styles
  const gridStyles: CSSProperties = {
    display: "grid",
    gridTemplateAreas: layout.gridTemplate,
    gridTemplateColumns: layout.gridColumns,
    gridTemplateRows: hero ? "auto auto 1fr auto" : "auto 1fr auto",
    minHeight: "100vh",
  };

  // Resolve content from props or sections
  const headerContent = header ?? sections?.header;
  const heroContent = hero ?? sections?.hero;
  const mainContent = main ?? sections?.main ?? children;
  const footerContent = footer ?? sections?.footer;

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
        className={`shell shell-classic ${className || ""}`}
        style={gridStyles}
        data-layout="classic"
        data-preview={isPreview || undefined}
      >
        {/* Header Section */}
        <header
          className="shell-section shell-section-header"
          style={{ gridArea: "header" }}
          data-section="header"
        >
          {headerContent}
        </header>

        {/* Hero Section (optional) */}
        {heroContent && (
          <section
            className="shell-section shell-section-hero"
            style={{ gridArea: "hero" }}
            data-section="hero"
          >
            {heroContent}
          </section>
        )}

        {/* Main Content Section */}
        <main
          className="shell-section shell-section-main"
          style={{
            gridArea: "main",
            maxWidth: maxContentWidth,
            width: "100%",
            marginInline: "auto",
            paddingInline: "var(--token-spacing-space4, 1rem)",
          }}
          data-section="main"
        >
          {mainContent}
        </main>

        {/* Footer Section */}
        <footer
          className="shell-section shell-section-footer"
          style={{ gridArea: "footer" }}
          data-section="footer"
        >
          {footerContent}
        </footer>
      </div>
    </ShellProvider>
  );
}

// ============================================================================
// Sub-components for convenience
// ============================================================================

/**
 * Classic header with logo, nav, and auth corner.
 */
export interface ClassicHeaderProps {
  /** Logo element */
  logo?: ReactNode;

  /** Navigation element */
  nav?: ReactNode;

  /** Auth UI element */
  auth?: ReactNode;

  /** Custom className */
  className?: string;
}

export function ClassicHeader({
  logo,
  nav,
  auth,
  className,
}: ClassicHeaderProps) {
  const { isPreview } = useShell();

  return (
    <div
      className={`classic-header ${className || ""}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--token-spacing-space3, 0.75rem) var(--token-spacing-space4, 1rem)",
        borderBottom: "1px solid var(--token-color-border, #e5e5e5)",
      }}
    >
      <div className="classic-header-logo">{logo}</div>
      <nav className="classic-header-nav" style={{ flex: 1, marginInline: "var(--token-spacing-space4, 1rem)" }}>
        {nav}
      </nav>
      {!isPreview && <div className="classic-header-auth">{auth}</div>}
    </div>
  );
}

/**
 * Classic footer with columns.
 */
export interface ClassicFooterProps {
  /** Left content (e.g., copyright) */
  left?: ReactNode;

  /** Center content (e.g., links) */
  center?: ReactNode;

  /** Right content (e.g., social) */
  right?: ReactNode;

  /** Custom className */
  className?: string;
}

export function ClassicFooter({
  left,
  center,
  right,
  className,
}: ClassicFooterProps) {
  return (
    <div
      className={`classic-footer ${className || ""}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--token-spacing-space4, 1rem)",
        borderTop: "1px solid var(--token-color-border, #e5e5e5)",
        backgroundColor: "var(--token-color-surface, #f9fafb)",
      }}
    >
      <div className="classic-footer-left">{left}</div>
      <div className="classic-footer-center">{center}</div>
      <div className="classic-footer-right">{right}</div>
    </div>
  );
}

// ============================================================================
// CSS Generation
// ============================================================================

/**
 * Generate CSS for ClassicShell.
 */
export function generateClassicShellCSS(): string {
  return `
.shell-classic {
  display: grid;
  grid-template-areas:
    "header"
    "hero"
    "main"
    "footer";
  grid-template-columns: 1fr;
  grid-template-rows: auto auto 1fr auto;
  min-height: 100vh;
}

.shell-classic .shell-section-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--token-color-background, #fff);
}

.shell-classic .shell-section-hero {
  width: 100%;
}

.shell-classic .shell-section-main {
  padding-block: var(--token-spacing-space6, 1.5rem);
}

.shell-classic .shell-section-footer {
  margin-top: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .classic-header {
    flex-wrap: wrap;
    gap: var(--token-spacing-space2, 0.5rem);
  }

  .classic-header-nav {
    order: 3;
    flex-basis: 100%;
    margin-inline: 0;
  }

  .classic-footer {
    flex-direction: column;
    gap: var(--token-spacing-space3, 0.75rem);
    text-align: center;
  }
}
`.trim();
}
