/**
 * Side Navigation Component
 *
 * Vertical navigation sidebar for left/right positioned navigation.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import { useState, useCallback } from "react";
import type { CSSProperties } from "react";
import type { NavItem, SideNavProps } from "../shells/types";

// ============================================================================
// Component
// ============================================================================

export function SideNav({
  items,
  position,
  authUI,
  collapsed = false,
  className,
}: SideNavProps) {
  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((itemId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const containerStyles: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "var(--token-color-surface, #f9fafb)",
  };

  return (
    <div
      className={`side-nav side-nav-${position} ${collapsed ? "side-nav-collapsed" : ""} ${className || ""}`}
      style={containerStyles}
      role="navigation"
      aria-label={`${position === "left" ? "Primary" : "Secondary"} navigation`}
    >
      {/* Navigation items */}
      <nav
        className="side-nav-items"
        style={{
          flex: 1,
          overflow: "auto",
          padding: collapsed
            ? "var(--token-spacing-space2, 0.5rem)"
            : "var(--token-spacing-space3, 0.75rem)",
        }}
      >
        {items.map((item) => (
          <SideNavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            isExpanded={expandedSections.has(item.id)}
            onToggle={() => toggleSection(item.id)}
          />
        ))}
      </nav>

      {/* Auth UI (for bottom-left position) */}
      {authUI && position === "left" && (
        <div
          className="side-nav-auth"
          style={{
            padding: "var(--token-spacing-space3, 0.75rem)",
            borderTop: "1px solid var(--token-color-border, #e5e5e5)",
          }}
        >
          {authUI}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Nav Item Component
// ============================================================================

interface SideNavItemProps {
  item: NavItem;
  collapsed?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  depth?: number;
}

function SideNavItem({
  item,
  collapsed = false,
  isExpanded = false,
  onToggle,
  depth = 0,
}: SideNavItemProps) {
  const hasChildren = item.children && item.children.length > 0;

  const itemStyles: CSSProperties = {
    marginBottom: "var(--token-spacing-space1, 0.25rem)",
  };

  const linkStyles: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: collapsed ? 0 : "var(--token-spacing-space2, 0.5rem)",
    padding: collapsed
      ? "var(--token-spacing-space2, 0.5rem)"
      : "var(--token-spacing-space2, 0.5rem) var(--token-spacing-space3, 0.75rem)",
    paddingLeft: collapsed ? undefined : `calc(var(--token-spacing-space3, 0.75rem) + ${depth * 12}px)`,
    color: item.isActive
      ? "var(--token-color-primary, #2563eb)"
      : "var(--token-color-text, #1f2937)",
    textDecoration: "none",
    borderRadius: "var(--token-shape-radius-md, 6px)",
    backgroundColor: item.isActive ? "var(--token-color-primary-light, #eff6ff)" : "transparent",
    fontWeight: item.isActive ? 500 : 400,
    fontSize: "var(--token-typography-font-size-sm, 0.875rem)",
    transition: "background-color 0.15s ease",
    cursor: "pointer",
    justifyContent: collapsed ? "center" : "flex-start",
    border: "none",
    width: "100%",
    textAlign: "left",
  };

  // Item with children (expandable section)
  if (hasChildren) {
    return (
      <div className="side-nav-item side-nav-item-section" style={itemStyles}>
        <button
          type="button"
          className="side-nav-link side-nav-section-toggle"
          style={{ ...linkStyles, background: "none" }}
          onClick={onToggle}
          aria-expanded={isExpanded}
          title={collapsed ? item.label : undefined}
        >
          {item.icon && (
            <span className="side-nav-icon" style={{ fontSize: "1.25em" }}>
              {item.icon}
            </span>
          )}
          {!collapsed && (
            <>
              <span className="side-nav-label" style={{ flex: 1 }}>{item.label}</span>
              <span
                className="side-nav-arrow"
                style={{
                  transition: "transform 0.2s ease",
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                ▶
              </span>
            </>
          )}
        </button>

        {isExpanded && !collapsed && (
          <div className="side-nav-children">
            {item.children!.map((child) => (
              <SideNavItem
                key={child.id}
                item={child}
                collapsed={collapsed}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular link item
  return (
    <div className="side-nav-item" style={itemStyles}>
      <a
        href={item.href}
        className="side-nav-link"
        style={linkStyles}
        target={item.isExternal ? "_blank" : undefined}
        rel={item.isExternal ? "noopener noreferrer" : undefined}
        aria-current={item.isActive ? "page" : undefined}
        title={collapsed ? item.label : undefined}
      >
        {item.icon && (
          <span className="side-nav-icon" style={{ fontSize: "1.25em" }}>
            {item.icon}
          </span>
        )}
        {!collapsed && (
          <>
            <span className="side-nav-label">{item.label}</span>
            {item.isExternal && <span className="side-nav-external">↗</span>}
          </>
        )}
      </a>
    </div>
  );
}

// ============================================================================
// Section Header Component
// ============================================================================

interface SideNavSectionProps {
  title: string;
  collapsed?: boolean;
  children: React.ReactNode;
}

export function SideNavSection({ title, collapsed, children }: SideNavSectionProps) {
  if (collapsed) {
    return <div className="side-nav-section">{children}</div>;
  }

  return (
    <div className="side-nav-section" style={{ marginBottom: "var(--token-spacing-space4, 1rem)" }}>
      <div
        className="side-nav-section-title"
        style={{
          padding: "var(--token-spacing-space2, 0.5rem) var(--token-spacing-space3, 0.75rem)",
          fontSize: "var(--token-typography-font-size-xs, 0.75rem)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--token-color-text-muted, #6b7280)",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

// ============================================================================
// CSS Generation
// ============================================================================

export function generateSideNavCSS(): string {
  return `
.side-nav {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--token-color-surface, #f9fafb);
}

.side-nav-items {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
}

.side-nav-link:hover {
  background-color: var(--token-color-surface-hover, #e5e7eb);
}

.side-nav-collapsed .side-nav-link {
  justify-content: center;
  padding: var(--token-spacing-space2, 0.5rem);
}

.side-nav-collapsed .side-nav-link:hover::after {
  content: attr(title);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: var(--token-spacing-space2, 0.5rem);
  padding: var(--token-spacing-space1, 0.25rem) var(--token-spacing-space2, 0.5rem);
  background: var(--token-color-surface-dark, #1f2937);
  color: var(--token-color-text-inverse, #fff);
  border-radius: var(--token-shape-radius-sm, 4px);
  font-size: var(--token-typography-font-size-sm, 0.875rem);
  white-space: nowrap;
  z-index: 100;
}
`.trim();
}
