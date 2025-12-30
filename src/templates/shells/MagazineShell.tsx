/**
 * Magazine Shell
 *
 * Content-focused layout with a right sidebar for related content,
 * ads, or navigation. NOT WA-compatible.
 *
 * Structure:
 * ┌─────────────────────────────────────┐
 * │             Header                  │
 * ├─────────────────────────────────────┤
 * │              Hero                   │
 * ├──────────────────────┬──────────────┤
 * │                      │              │
 * │        Main          │   Sidebar    │
 * │                      │              │
 * ├──────────────────────┴──────────────┤
 * │             Footer                  │
 * └─────────────────────────────────────┘
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import type { ReactNode, CSSProperties } from "react";
import type { ShellProps } from "./types";
import { ShellProvider } from "./ShellContext";
import { getLayout } from "@/lib/layouts/registry";

// ============================================================================
// Magazine Shell Props
// ============================================================================

export interface MagazineShellProps extends Omit<ShellProps, "layout"> {
  /** Header content */
  header?: ReactNode;

  /** Hero section content (optional) */
  hero?: ReactNode;

  /** Main content */
  main?: ReactNode;

  /** Right sidebar content */
  sidebar?: ReactNode;

  /** Footer content */
  footer?: ReactNode;

  /** Main content max width */
  mainMaxWidth?: string;

  /** Sidebar width */
  sidebarWidth?: string;
}

// ============================================================================
// Component
// ============================================================================

export function MagazineShell({
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
  sidebar,
  footer,
  mainMaxWidth = "900px",
  sidebarWidth = "300px",
}: MagazineShellProps) {
  const layout = getLayout("magazine");

  // Grid styles
  const gridStyles: CSSProperties = {
    display: "grid",
    gridTemplateAreas: hero
      ? `"header header"
         "hero hero"
         "main panel"
         "footer footer"`
      : `"header header"
         "main panel"
         "footer footer"`,
    gridTemplateColumns: `1fr minmax(250px, ${sidebarWidth})`,
    gridTemplateRows: hero ? "auto auto 1fr auto" : "auto 1fr auto",
    minHeight: "100vh",
    gap: "0",
  };

  // Resolve content
  const headerContent = header ?? sections?.header;
  const heroContent = hero ?? sections?.hero;
  const mainContent = main ?? sections?.main ?? children;
  const sidebarContent = sidebar ?? sections?.panel ?? sections?.sidebar;
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
        className={`shell shell-magazine ${className || ""}`}
        style={gridStyles}
        data-layout="magazine"
        data-preview={isPreview || undefined}
      >
        {/* Header */}
        <header
          className="shell-section shell-section-header"
          style={{ gridArea: "header" }}
          data-section="header"
        >
          {headerContent}
        </header>

        {/* Hero (optional) */}
        {heroContent && (
          <section
            className="shell-section shell-section-hero"
            style={{ gridArea: "hero" }}
            data-section="hero"
          >
            {heroContent}
          </section>
        )}

        {/* Main Content */}
        <main
          className="shell-section shell-section-main"
          style={{
            gridArea: "main",
            maxWidth: mainMaxWidth,
            padding: "var(--token-spacing-space4, 1rem)",
          }}
          data-section="main"
        >
          {mainContent}
        </main>

        {/* Right Sidebar */}
        <aside
          className="shell-section shell-section-panel"
          style={{
            gridArea: "panel",
            borderLeft: "1px solid var(--token-color-border, #e5e5e5)",
            padding: "var(--token-spacing-space4, 1rem)",
            backgroundColor: "var(--token-color-surface, #f9fafb)",
          }}
          data-section="panel"
        >
          {sidebarContent}
        </aside>

        {/* Footer */}
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
// CSS Generation
// ============================================================================

export function generateMagazineShellCSS(): string {
  return `
.shell-magazine {
  display: grid;
  grid-template-areas:
    "header header"
    "hero hero"
    "main panel"
    "footer footer";
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto auto 1fr auto;
  min-height: 100vh;
}

.shell-magazine .shell-section-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--token-color-background, #fff);
}

.shell-magazine .shell-section-panel {
  position: sticky;
  top: 60px;
  align-self: start;
  max-height: calc(100vh - 60px);
  overflow-y: auto;
}

/* Responsive - stack sidebar below main on mobile */
@media (max-width: 900px) {
  .shell-magazine {
    grid-template-areas:
      "header"
      "hero"
      "main"
      "panel"
      "footer";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto auto;
  }

  .shell-magazine .shell-section-panel {
    position: static;
    max-height: none;
    border-left: none;
    border-top: 1px solid var(--token-color-border, #e5e5e5);
  }
}
`.trim();
}
