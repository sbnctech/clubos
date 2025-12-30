/**
 * Focus Shell
 *
 * Minimal chrome layout for focused reading or forms.
 * Centered content with reduced navigation.
 * WA-compatible.
 *
 * Structure:
 * ┌─────────────────────────────────────┐
 * │         Header (minimal)            │
 * ├─────────────────────────────────────┤
 * │                                     │
 * │         Main (centered)             │
 * │                                     │
 * ├─────────────────────────────────────┤
 * │         Footer (minimal)            │
 * └─────────────────────────────────────┘
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";
import type { ShellProps } from "./types";
import { ShellProvider } from "./ShellContext";
import { getLayout } from "@/lib/layouts/registry";

// ============================================================================
// Focus Shell Props
// ============================================================================

export interface FocusShellProps extends Omit<ShellProps, "layout"> {
  /** Header content (minimal - usually just logo + back link) */
  header?: ReactNode;

  /** Main content (centered) */
  main?: ReactNode;

  /** Footer content (minimal) */
  footer?: ReactNode;

  /** Maximum content width */
  maxWidth?: string;

  /** Whether to show header */
  showHeader?: boolean;

  /** Whether to show footer */
  showFooter?: boolean;

  /** Back link element */
  backLink?: ReactNode;

  /** Logo element */
  logo?: ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export function FocusShell({
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
  main,
  footer,
  maxWidth = "680px",
  showHeader = true,
  showFooter = true,
  backLink,
  logo,
}: FocusShellProps) {
  const layout = getLayout("focus");

  // Grid styles
  const gridStyles: CSSProperties = {
    display: "grid",
    gridTemplateAreas: `
      "header"
      "main"
      "footer"
    `,
    gridTemplateColumns: "1fr",
    gridTemplateRows: showHeader && showFooter
      ? "auto 1fr auto"
      : showHeader
        ? "auto 1fr"
        : showFooter
          ? "1fr auto"
          : "1fr",
    minHeight: "100vh",
  };

  // Resolve content
  const headerContent = header ?? sections?.header;
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
        className={`shell shell-focus ${className || ""}`}
        style={gridStyles}
        data-layout="focus"
        data-preview={isPreview || undefined}
      >
        {/* Minimal Header */}
        {showHeader && (
          <header
            className="shell-section shell-section-header"
            style={{
              gridArea: "header",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--token-spacing-space3, 0.75rem) var(--token-spacing-space4, 1rem)",
              maxWidth: "100%",
            }}
            data-section="header"
          >
            {headerContent ?? (
              <FocusHeader
                backLink={backLink}
                logo={logo}
                isPreview={isPreview}
              />
            )}
          </header>
        )}

        {/* Centered Main Content */}
        <main
          className="shell-section shell-section-main"
          style={{
            gridArea: "main",
            maxWidth: maxWidth,
            width: "100%",
            marginInline: "auto",
            paddingInline: "var(--token-spacing-space4, 1rem)",
            paddingBlock: "var(--token-spacing-space6, 1.5rem)",
          }}
          data-section="main"
        >
          {mainContent}
        </main>

        {/* Minimal Footer */}
        {showFooter && (
          <footer
            className="shell-section shell-section-footer"
            style={{
              gridArea: "footer",
              textAlign: "center",
              padding: "var(--token-spacing-space4, 1rem)",
              color: "var(--token-color-text-muted, #6b7280)",
              fontSize: "var(--token-typography-font-size-sm, 0.875rem)",
            }}
            data-section="footer"
          >
            {footerContent}
          </footer>
        )}
      </div>
    </ShellProvider>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface FocusHeaderProps {
  backLink?: ReactNode;
  logo?: ReactNode;
  isPreview?: boolean;
}

function FocusHeader({ backLink, logo, isPreview: _isPreview }: FocusHeaderProps) {
  return (
    <div
      className="focus-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: "680px",
        marginInline: "auto",
      }}
    >
      <div className="focus-header-left">
        {backLink ?? (
          <Link
            href="/"
            style={{
              color: "var(--token-color-text-muted, #6b7280)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "var(--token-spacing-space1, 0.25rem)",
            }}
          >
            ← Back
          </Link>
        )}
      </div>
      <div className="focus-header-center">{logo}</div>
      <div className="focus-header-right" style={{ width: "60px" }}>
        {/* Placeholder for auth if needed */}
      </div>
    </div>
  );
}

/**
 * Focus content wrapper with proper typography.
 */
export interface FocusContentProps {
  /** Content */
  children: ReactNode;

  /** Custom className */
  className?: string;
}

export function FocusContent({ children, className }: FocusContentProps) {
  return (
    <article
      className={`focus-content ${className || ""}`}
      style={{
        lineHeight: "1.7",
        fontSize: "var(--token-typography-font-size-lg, 1.125rem)",
      }}
    >
      {children}
    </article>
  );
}

// ============================================================================
// CSS Generation
// ============================================================================

export function generateFocusShellCSS(): string {
  return `
.shell-focus {
  display: grid;
  grid-template-areas:
    "header"
    "main"
    "footer";
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  background: var(--token-color-background, #fff);
}

.shell-focus .shell-section-main {
  max-width: 680px;
  margin-inline: auto;
}

.focus-content {
  font-family: var(--token-typography-font-body, Georgia, serif);
  line-height: 1.7;
}

.focus-content h1,
.focus-content h2,
.focus-content h3 {
  font-family: var(--token-typography-font-heading, system-ui, sans-serif);
  line-height: 1.3;
  margin-top: 2em;
  margin-bottom: 0.5em;
}

.focus-content p {
  margin-bottom: 1.5em;
}

.focus-content img {
  max-width: 100%;
  height: auto;
  margin-block: 2em;
}

/* Responsive */
@media (max-width: 768px) {
  .shell-focus .shell-section-main {
    padding-inline: var(--token-spacing-space3, 0.75rem);
  }

  .focus-content {
    font-size: var(--token-typography-font-size-base, 1rem);
  }
}
`.trim();
}
