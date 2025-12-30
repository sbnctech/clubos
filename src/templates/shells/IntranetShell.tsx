/**
 * Intranet Shell
 *
 * Full-featured layout with dual sidebars for rich intranet sites.
 * Left sidebar for navigation, right sidebar for contextual content.
 * NOT WA-compatible.
 *
 * Structure:
 * ┌─────────────────────────────────────────────┐
 * │                  Header                     │
 * ├──────────┬───────────────────┬──────────────┤
 * │          │                   │              │
 * │ NavLeft  │       Main        │    Panel     │
 * │          │                   │              │
 * │  [Auth]  │                   │              │
 * ├──────────┴───────────────────┴──────────────┤
 * │                  Footer                     │
 * └─────────────────────────────────────────────┘
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import type { ReactNode, CSSProperties } from "react";
import type { ShellProps } from "./types";
import { ShellProvider, useShell, useSidebar } from "./ShellContext";
import { getLayout } from "@/lib/layouts/registry";

// ============================================================================
// Intranet Shell Props
// ============================================================================

export interface IntranetShellProps extends Omit<ShellProps, "layout"> {
  /** Header content */
  header?: ReactNode;

  /** Left navigation sidebar content */
  navLeft?: ReactNode;

  /** Main content */
  main?: ReactNode;

  /** Right panel content */
  panel?: ReactNode;

  /** Footer content */
  footer?: ReactNode;

  /** Logo for sidebar */
  logo?: ReactNode;

  /** Auth UI for sidebar (bottom-left position) */
  sidebarAuth?: ReactNode;

  /** Auth UI for header (top-right position) */
  headerAuth?: ReactNode;

  /** Left sidebar width */
  navWidth?: string;

  /** Right panel width */
  panelWidth?: string;

  /** Whether left sidebar is collapsible */
  collapsible?: boolean;

  /** Whether right panel is collapsible */
  panelCollapsible?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function IntranetShell({
  authPosition = "bottom-left",
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
  navLeft,
  main,
  panel,
  footer,
  logo,
  sidebarAuth,
  headerAuth,
  navWidth = "220px",
  panelWidth = "280px",
  collapsible = true,
  panelCollapsible = true,
}: IntranetShellProps) {
  const layout = getLayout("intranet");

  return (
    <ShellProvider
      layout={layout}
      authPosition={authPosition}
      isPreview={isPreview}
      isAuthenticated={isAuthenticated}
      user={user}
      navItems={navItems}
    >
      <IntranetShellInner
        className={className}
        isPreview={isPreview}
        header={header ?? sections?.header}
        navLeft={navLeft ?? sections?.["nav-left"]}
        main={main ?? sections?.main ?? children}
        panel={panel ?? sections?.panel}
        footer={footer ?? sections?.footer}
        logo={logo}
        sidebarAuth={sidebarAuth}
        headerAuth={headerAuth}
        navWidth={navWidth}
        panelWidth={panelWidth}
        collapsible={collapsible}
        panelCollapsible={panelCollapsible}
      />
    </ShellProvider>
  );
}

// Inner component to access context
interface IntranetShellInnerProps {
  className?: string;
  isPreview: boolean;
  header: ReactNode;
  navLeft: ReactNode;
  main: ReactNode;
  panel: ReactNode;
  footer: ReactNode;
  logo?: ReactNode;
  sidebarAuth?: ReactNode;
  headerAuth?: ReactNode;
  navWidth: string;
  panelWidth: string;
  collapsible: boolean;
  panelCollapsible: boolean;
}

function IntranetShellInner({
  className,
  isPreview,
  header,
  navLeft,
  main,
  panel,
  footer,
  logo,
  sidebarAuth,
  headerAuth,
  navWidth,
  panelWidth,
  collapsible,
  panelCollapsible,
}: IntranetShellInnerProps) {
  const { authPosition } = useShell();
  const { collapsed, toggle } = useSidebar();

  // Panel collapse state (separate from nav)
  // For simplicity, using a CSS class approach here
  const panelVisible = panel !== undefined && panel !== null;

  const currentNavWidth = collapsed ? "60px" : navWidth;

  const gridStyles: CSSProperties = {
    display: "grid",
    gridTemplateAreas: panelVisible
      ? `
        "header header header"
        "nav-left main panel"
        "footer footer footer"
      `
      : `
        "header header"
        "nav-left main"
        "footer footer"
      `,
    gridTemplateColumns: panelVisible
      ? `${currentNavWidth} 1fr ${panelWidth}`
      : `${currentNavWidth} 1fr`,
    gridTemplateRows: "auto 1fr auto",
    minHeight: "100vh",
    transition: "grid-template-columns 0.2s ease",
  };

  const showSidebarAuth = authPosition === "bottom-left" && !isPreview;
  const showHeaderAuth = authPosition === "top-right" && !isPreview;

  return (
    <div
      className={`shell shell-intranet ${className || ""}`}
      style={gridStyles}
      data-layout="intranet"
      data-preview={isPreview || undefined}
      data-sidebar-collapsed={collapsed || undefined}
    >
      {/* Header */}
      <header
        className="shell-section shell-section-header"
        style={{
          gridArea: "header",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--token-spacing-space3, 0.75rem) var(--token-spacing-space4, 1rem)",
          borderBottom: "1px solid var(--token-color-border, #e5e5e5)",
          backgroundColor: "var(--token-color-background, #fff)",
        }}
        data-section="header"
      >
        <div className="intranet-header-content" style={{ flex: 1 }}>
          {header}
        </div>
        {showHeaderAuth && (
          <div className="intranet-header-auth">{headerAuth}</div>
        )}
      </header>

      {/* Left Navigation Sidebar */}
      <aside
        className="shell-section shell-section-nav-left"
        style={{
          gridArea: "nav-left",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--token-color-border, #e5e5e5)",
          backgroundColor: "var(--token-color-surface, #f9fafb)",
          overflow: "hidden",
        }}
        data-section="nav-left"
      >
        {/* Logo */}
        <div
          className="intranet-sidebar-logo"
          style={{
            padding: "var(--token-spacing-space3, 0.75rem)",
            borderBottom: "1px solid var(--token-color-border, #e5e5e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
          }}
        >
          {!collapsed && logo}
          {collapsible && (
            <button
              type="button"
              onClick={toggle}
              className="intranet-collapse-toggle"
              style={{
                padding: "var(--token-spacing-space1, 0.25rem)",
                background: "var(--token-color-surface-hover, #e5e7eb)",
                border: "none",
                borderRadius: "var(--token-shape-radius-sm, 4px)",
                cursor: "pointer",
              }}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? "→" : "←"}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          className="intranet-sidebar-nav"
          style={{
            flex: 1,
            overflow: "auto",
            padding: collapsed
              ? "var(--token-spacing-space2, 0.5rem)"
              : "var(--token-spacing-space3, 0.75rem)",
          }}
        >
          {navLeft}
        </nav>

        {/* Bottom Auth */}
        {showSidebarAuth && (
          <div
            className="intranet-sidebar-auth"
            style={{
              padding: "var(--token-spacing-space3, 0.75rem)",
              borderTop: "1px solid var(--token-color-border, #e5e5e5)",
            }}
          >
            {sidebarAuth}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main
        className="shell-section shell-section-main"
        style={{
          gridArea: "main",
          padding: "var(--token-spacing-space4, 1rem)",
          overflow: "auto",
        }}
        data-section="main"
      >
        {main}
      </main>

      {/* Right Panel */}
      {panelVisible && (
        <aside
          className="shell-section shell-section-panel"
          style={{
            gridArea: "panel",
            borderLeft: "1px solid var(--token-color-border, #e5e5e5)",
            backgroundColor: "var(--token-color-surface, #f9fafb)",
            padding: "var(--token-spacing-space4, 1rem)",
            overflow: "auto",
          }}
          data-section="panel"
        >
          {panel}
        </aside>
      )}

      {/* Footer */}
      <footer
        className="shell-section shell-section-footer"
        style={{
          gridArea: "footer",
          borderTop: "1px solid var(--token-color-border, #e5e5e5)",
          padding: "var(--token-spacing-space3, 0.75rem) var(--token-spacing-space4, 1rem)",
          backgroundColor: "var(--token-color-surface, #f9fafb)",
        }}
        data-section="footer"
      >
        {footer}
      </footer>
    </div>
  );
}

// ============================================================================
// CSS Generation
// ============================================================================

export function generateIntranetShellCSS(): string {
  return `
.shell-intranet {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav-left main panel"
    "footer footer footer";
  grid-template-columns: 220px 1fr 280px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.shell-intranet .shell-section-header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.shell-intranet .shell-section-nav-left {
  position: sticky;
  top: 60px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.shell-intranet .shell-section-panel {
  position: sticky;
  top: 60px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.shell-intranet[data-sidebar-collapsed] {
  grid-template-columns: 60px 1fr 280px;
}

/* Without panel */
.shell-intranet:not(:has(.shell-section-panel)) {
  grid-template-areas:
    "header header"
    "nav-left main"
    "footer footer";
  grid-template-columns: 220px 1fr;
}

/* Responsive - stack on tablet */
@media (max-width: 1024px) {
  .shell-intranet {
    grid-template-areas:
      "header header"
      "nav-left main"
      "footer footer";
    grid-template-columns: 220px 1fr;
  }

  .shell-intranet .shell-section-panel {
    display: none;
  }
}

/* Responsive - hide nav on mobile */
@media (max-width: 768px) {
  .shell-intranet {
    grid-template-areas:
      "header"
      "main"
      "footer";
    grid-template-columns: 1fr;
  }

  .shell-intranet .shell-section-nav-left {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 250px;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .shell-intranet[data-mobile-nav-open] .shell-section-nav-left {
    transform: translateX(0);
  }
}
`.trim();
}
