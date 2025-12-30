/**
 * Sidebar Auth Component
 *
 * Bottom-left auth UI for dashboard/portal layouts.
 * Modern app-style placement (Linear, Notion style).
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import { useState, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import type { SidebarAuthProps } from "../shells/types";
import { UserAvatar } from "./UserAvatar";

// ============================================================================
// Component
// ============================================================================

export function SidebarAuth({
  isAuthenticated,
  user,
  onLogin,
  onLogout,
  isPreview = false,
  collapsed = false,
  className,
}: SidebarAuthProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Don't render in preview mode
  if (isPreview) {
    return null;
  }

  const containerStyles: CSSProperties = {
    position: "relative",
  };

  // Not authenticated - show login button
  if (!isAuthenticated) {
    return (
      <div className={`sidebar-auth sidebar-auth-guest ${className || ""}`} style={containerStyles}>
        <button
          type="button"
          onClick={onLogin}
          className="sidebar-auth-login"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "var(--token-spacing-space2, 0.5rem)",
            width: "100%",
            padding: "var(--token-spacing-space2, 0.5rem)",
            backgroundColor: "transparent",
            color: "inherit",
            border: "1px solid currentColor",
            borderRadius: "var(--token-shape-radius-md, 6px)",
            cursor: "pointer",
            fontSize: "var(--token-typography-font-size-sm, 0.875rem)",
            opacity: 0.8,
            transition: "opacity 0.15s ease",
          }}
          title={collapsed ? "Log In" : undefined}
        >
          <span>👤</span>
          {!collapsed && <span>Log In</span>}
        </button>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Authenticated - show user info with popup menu
  return (
    <div
      ref={menuRef}
      className={`sidebar-auth sidebar-auth-user ${className || ""}`}
      style={containerStyles}
    >
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="sidebar-auth-trigger"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--token-spacing-space2, 0.5rem)",
          width: "100%",
          padding: "var(--token-spacing-space2, 0.5rem)",
          backgroundColor: "transparent",
          border: "none",
          borderRadius: "var(--token-shape-radius-md, 6px)",
          cursor: "pointer",
          color: "inherit",
          textAlign: "left",
          transition: "background-color 0.15s ease",
        }}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        title={collapsed ? user.displayName : undefined}
      >
        <UserAvatar user={user} size="sm" />
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 500,
                fontSize: "var(--token-typography-font-size-sm, 0.875rem)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.displayName}
            </div>
            {user.email && (
              <div
                style={{
                  fontSize: "var(--token-typography-font-size-xs, 0.75rem)",
                  opacity: 0.7,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email}
              </div>
            )}
          </div>
        )}
        {!collapsed && (
          <span style={{ opacity: 0.5 }}>{menuOpen ? "▲" : "▼"}</span>
        )}
      </button>

      {/* Popup menu */}
      {menuOpen && (
        <div
          className="sidebar-auth-menu"
          role="menu"
          style={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            right: collapsed ? "auto" : 0,
            minWidth: collapsed ? "180px" : "100%",
            marginBottom: "var(--token-spacing-space1, 0.25rem)",
            backgroundColor: "var(--token-color-background, #fff)",
            border: "1px solid var(--token-color-border, #e5e5e5)",
            borderRadius: "var(--token-shape-radius-md, 6px)",
            boxShadow: "var(--token-shape-shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1))",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          {/* User info header */}
          <div
            style={{
              padding: "var(--token-spacing-space3, 0.75rem)",
              borderBottom: "1px solid var(--token-color-border, #e5e5e5)",
            }}
          >
            <div style={{ fontWeight: 500 }}>{user.displayName}</div>
            {user.email && (
              <div
                style={{
                  fontSize: "var(--token-typography-font-size-sm, 0.875rem)",
                  color: "var(--token-color-text-muted, #6b7280)",
                }}
              >
                {user.email}
              </div>
            )}
          </div>

          {/* Menu items */}
          <div style={{ padding: "var(--token-spacing-space1, 0.25rem)" }}>
            <SidebarAuthMenuItem
              label="Profile"
              href="/profile"
              onClick={() => setMenuOpen(false)}
            />
            <SidebarAuthMenuItem
              label="Settings"
              href="/settings"
              onClick={() => setMenuOpen(false)}
            />
            <div
              style={{
                height: "1px",
                backgroundColor: "var(--token-color-border, #e5e5e5)",
                margin: "var(--token-spacing-space1, 0.25rem) 0",
              }}
            />
            <SidebarAuthMenuItem
              label="Log Out"
              onClick={() => {
                setMenuOpen(false);
                onLogout?.();
              }}
              isDestructive
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Menu Item Component
// ============================================================================

interface SidebarAuthMenuItemProps {
  label: string;
  href?: string;
  onClick?: () => void;
  isDestructive?: boolean;
}

function SidebarAuthMenuItem({
  label,
  href,
  onClick,
  isDestructive,
}: SidebarAuthMenuItemProps) {
  const itemStyles: CSSProperties = {
    display: "block",
    width: "100%",
    padding: "var(--token-spacing-space2, 0.5rem) var(--token-spacing-space3, 0.75rem)",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "var(--token-shape-radius-sm, 4px)",
    color: isDestructive
      ? "var(--token-color-error, #dc2626)"
      : "var(--token-color-text, #1f2937)",
    textDecoration: "none",
    textAlign: "left",
    fontSize: "var(--token-typography-font-size-sm, 0.875rem)",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  };

  if (href) {
    return (
      <a href={href} className="sidebar-auth-menu-item" style={itemStyles} onClick={onClick} role="menuitem">
        {label}
      </a>
    );
  }

  return (
    <button type="button" className="sidebar-auth-menu-item" style={itemStyles} onClick={onClick} role="menuitem">
      {label}
    </button>
  );
}

// ============================================================================
// CSS Generation
// ============================================================================

export function generateSidebarAuthCSS(): string {
  return `
.sidebar-auth-trigger:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-auth-login:hover {
  opacity: 1;
}

.sidebar-auth-menu-item:hover {
  background-color: var(--token-color-surface-hover, #f3f4f6);
}

/* Dark sidebar variant */
.shell-section-nav-left .sidebar-auth-trigger:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.shell-section-nav-left .sidebar-auth-menu {
  color: var(--token-color-text, #1f2937);
}
`.trim();
}
