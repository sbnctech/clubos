/**
 * Top Navigation Component
 *
 * Horizontal navigation bar for top-positioned navigation layouts.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import { useState, useCallback } from "react";
import type { CSSProperties } from "react";
import type { NavItem, TopNavProps } from "../shells/types";

// ============================================================================
// Component
// ============================================================================

export function TopNav({
  items,
  logo,
  authUI,
  navPosition,
  showMobileToggle = true,
  mobileMenuOpen = false,
  onMobileToggle,
  className,
}: TopNavProps) {
  // Dropdown states for items with children
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdownToggle = useCallback((itemId: string) => {
    setOpenDropdown((prev) => (prev === itemId ? null : itemId));
  }, []);

  const handleDropdownClose = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  const containerStyles: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--token-spacing-space4, 1rem)",
    padding: "var(--token-spacing-space2, 0.5rem) var(--token-spacing-space4, 1rem)",
    backgroundColor: "var(--token-color-background, #fff)",
    borderBottom: "1px solid var(--token-color-border, #e5e5e5)",
  };

  // Minimal nav just shows logo + auth
  if (navPosition === "minimal") {
    return (
      <div className={`top-nav top-nav-minimal ${className || ""}`} style={containerStyles}>
        <div className="top-nav-logo">{logo}</div>
        <div className="top-nav-spacer" style={{ flex: 1 }} />
        {authUI && <div className="top-nav-auth">{authUI}</div>}
      </div>
    );
  }

  // No nav
  if (navPosition === "none") {
    return null;
  }

  return (
    <div
      className={`top-nav ${className || ""}`}
      style={containerStyles}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="top-nav-logo">{logo}</div>

      {/* Mobile toggle */}
      {showMobileToggle && (
        <button
          type="button"
          className="top-nav-mobile-toggle"
          onClick={onMobileToggle}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
          style={{
            display: "none",
            padding: "var(--token-spacing-space2, 0.5rem)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span className="top-nav-hamburger">☰</span>
        </button>
      )}

      {/* Navigation items */}
      <nav className="top-nav-items" style={{ display: "flex", gap: "var(--token-spacing-space1, 0.25rem)", flex: 1 }}>
        {items.map((item) => (
          <TopNavItem
            key={item.id}
            item={item}
            isOpen={openDropdown === item.id}
            onToggle={() => handleDropdownToggle(item.id)}
            onClose={handleDropdownClose}
          />
        ))}
      </nav>

      {/* Auth UI */}
      {authUI && <div className="top-nav-auth">{authUI}</div>}
    </div>
  );
}

// ============================================================================
// Nav Item Component
// ============================================================================

interface TopNavItemProps {
  item: NavItem;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

function TopNavItem({ item, isOpen, onToggle, onClose }: TopNavItemProps) {
  const hasChildren = item.children && item.children.length > 0;

  const itemStyles: CSSProperties = {
    position: "relative",
  };

  const linkStyles: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--token-spacing-space1, 0.25rem)",
    padding: "var(--token-spacing-space2, 0.5rem) var(--token-spacing-space3, 0.75rem)",
    color: item.isActive
      ? "var(--token-color-primary, #2563eb)"
      : "var(--token-color-text, #1f2937)",
    textDecoration: "none",
    borderRadius: "var(--token-shape-radius-md, 6px)",
    backgroundColor: item.isActive ? "var(--token-color-primary-light, #eff6ff)" : "transparent",
    fontWeight: item.isActive ? 500 : 400,
    transition: "background-color 0.15s ease",
    cursor: "pointer",
  };

  // Item with dropdown
  if (hasChildren) {
    return (
      <div className="top-nav-item top-nav-item-dropdown" style={itemStyles}>
        <button
          type="button"
          className="top-nav-link"
          style={{ ...linkStyles, border: "none", background: "none" }}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {item.icon && <span className="top-nav-icon">{item.icon}</span>}
          <span>{item.label}</span>
          <span className="top-nav-arrow" style={{ marginLeft: "auto" }}>
            {isOpen ? "▲" : "▼"}
          </span>
        </button>

        {isOpen && (
          <div
            className="top-nav-dropdown"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              minWidth: "180px",
              backgroundColor: "var(--token-color-background, #fff)",
              border: "1px solid var(--token-color-border, #e5e5e5)",
              borderRadius: "var(--token-shape-radius-md, 6px)",
              boxShadow: "var(--token-shape-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))",
              zIndex: 100,
              padding: "var(--token-spacing-space1, 0.25rem)",
            }}
          >
            {item.children!.map((child) => (
              <TopNavDropdownItem key={child.id} item={child} onClose={onClose} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular link item
  return (
    <div className="top-nav-item" style={itemStyles}>
      <a
        href={item.href}
        className="top-nav-link"
        style={linkStyles}
        target={item.isExternal ? "_blank" : undefined}
        rel={item.isExternal ? "noopener noreferrer" : undefined}
        aria-current={item.isActive ? "page" : undefined}
      >
        {item.icon && <span className="top-nav-icon">{item.icon}</span>}
        <span>{item.label}</span>
        {item.isExternal && <span className="top-nav-external">↗</span>}
      </a>
    </div>
  );
}

// ============================================================================
// Dropdown Item Component
// ============================================================================

interface TopNavDropdownItemProps {
  item: NavItem;
  onClose?: () => void;
}

function TopNavDropdownItem({ item, onClose }: TopNavDropdownItemProps) {
  const linkStyles: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--token-spacing-space2, 0.5rem)",
    padding: "var(--token-spacing-space2, 0.5rem) var(--token-spacing-space3, 0.75rem)",
    color: "var(--token-color-text, #1f2937)",
    textDecoration: "none",
    borderRadius: "var(--token-shape-radius-sm, 4px)",
    transition: "background-color 0.15s ease",
  };

  return (
    <a
      href={item.href}
      className="top-nav-dropdown-item"
      style={linkStyles}
      target={item.isExternal ? "_blank" : undefined}
      rel={item.isExternal ? "noopener noreferrer" : undefined}
      onClick={onClose}
    >
      {item.icon && <span className="top-nav-icon">{item.icon}</span>}
      <span>{item.label}</span>
      {item.isExternal && <span className="top-nav-external">↗</span>}
    </a>
  );
}

// ============================================================================
// CSS Generation
// ============================================================================

export function generateTopNavCSS(): string {
  return `
.top-nav {
  display: flex;
  align-items: center;
  gap: var(--token-spacing-space4, 1rem);
  padding: var(--token-spacing-space2, 0.5rem) var(--token-spacing-space4, 1rem);
  background: var(--token-color-background, #fff);
  border-bottom: 1px solid var(--token-color-border, #e5e5e5);
}

.top-nav-link:hover {
  background-color: var(--token-color-surface-hover, #f3f4f6);
}

.top-nav-dropdown-item:hover {
  background-color: var(--token-color-surface-hover, #f3f4f6);
}

/* Responsive */
@media (max-width: 768px) {
  .top-nav-items {
    display: none !important;
  }

  .top-nav-mobile-toggle {
    display: flex !important;
  }
}
`.trim();
}
