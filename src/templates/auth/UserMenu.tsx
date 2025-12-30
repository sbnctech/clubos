/**
 * User Menu Component
 *
 * Dropdown menu for authenticated users.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import { useState, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import type { UserMenuProps, UserMenuItem } from "../shells/types";
import { UserAvatar } from "./UserAvatar";

// ============================================================================
// Default Menu Items
// ============================================================================

const DEFAULT_MENU_ITEMS: UserMenuItem[] = [
  { id: "profile", label: "Profile", href: "/profile" },
  { id: "settings", label: "Settings", href: "/settings" },
  { id: "divider-1", label: "", divider: true },
  { id: "logout", label: "Log Out" },
];

// ============================================================================
// Component
// ============================================================================

export function UserMenu({
  user,
  menuItems = DEFAULT_MENU_ITEMS,
  onLogout,
  className,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const containerStyles: CSSProperties = {
    position: "relative",
  };

  const triggerStyles: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--token-spacing-space2, 0.5rem)",
    padding: "var(--token-spacing-space1, 0.25rem)",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "var(--token-shape-radius-full, 9999px)",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  };

  const dropdownStyles: CSSProperties = {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "var(--token-spacing-space1, 0.25rem)",
    minWidth: "200px",
    backgroundColor: "var(--token-color-background, #fff)",
    border: "1px solid var(--token-color-border, #e5e5e5)",
    borderRadius: "var(--token-shape-radius-md, 6px)",
    boxShadow: "var(--token-shape-shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1))",
    zIndex: 100,
    overflow: "hidden",
  };

  return (
    <div ref={menuRef} className={`user-menu ${className || ""}`} style={containerStyles}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="user-menu-trigger"
        style={triggerStyles}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User menu"
      >
        <UserAvatar user={user} size="sm" />
        <span
          style={{
            fontSize: "var(--token-typography-font-size-sm, 0.875rem)",
            fontWeight: 500,
            color: "var(--token-color-text, #1f2937)",
          }}
        >
          {user.displayName}
        </span>
        <span
          style={{
            fontSize: "0.75em",
            color: "var(--token-color-text-muted, #6b7280)",
          }}
        >
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="user-menu-dropdown" style={dropdownStyles} role="menu">
          {/* User header */}
          <div
            className="user-menu-header"
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
          <div
            className="user-menu-items"
            style={{ padding: "var(--token-spacing-space1, 0.25rem)" }}
          >
            {menuItems.map((item) => {
              if (item.divider) {
                return (
                  <div
                    key={item.id}
                    className="user-menu-divider"
                    style={{
                      height: "1px",
                      backgroundColor: "var(--token-color-border, #e5e5e5)",
                      margin: "var(--token-spacing-space1, 0.25rem) 0",
                    }}
                  />
                );
              }

              // Handle logout specially
              if (item.id === "logout") {
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="user-menu-item user-menu-item-danger"
                    onClick={() => {
                      setIsOpen(false);
                      onLogout?.();
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "var(--token-spacing-space2, 0.5rem) var(--token-spacing-space3, 0.75rem)",
                      backgroundColor: "transparent",
                      border: "none",
                      borderRadius: "var(--token-shape-radius-sm, 4px)",
                      color: "var(--token-color-error, #dc2626)",
                      textAlign: "left",
                      fontSize: "var(--token-typography-font-size-sm, 0.875rem)",
                      cursor: "pointer",
                    }}
                    role="menuitem"
                  >
                    {item.icon && <span style={{ marginRight: "var(--token-spacing-space2, 0.5rem)" }}>{item.icon}</span>}
                    {item.label}
                  </button>
                );
              }

              // Regular menu item
              if (item.href) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className="user-menu-item"
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: "block",
                      padding: "var(--token-spacing-space2, 0.5rem) var(--token-spacing-space3, 0.75rem)",
                      color: "var(--token-color-text, #1f2937)",
                      textDecoration: "none",
                      borderRadius: "var(--token-shape-radius-sm, 4px)",
                      fontSize: "var(--token-typography-font-size-sm, 0.875rem)",
                    }}
                    role="menuitem"
                  >
                    {item.icon && <span style={{ marginRight: "var(--token-spacing-space2, 0.5rem)" }}>{item.icon}</span>}
                    {item.label}
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  className="user-menu-item"
                  onClick={() => {
                    setIsOpen(false);
                    item.onClick?.();
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "var(--token-spacing-space2, 0.5rem) var(--token-spacing-space3, 0.75rem)",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "var(--token-shape-radius-sm, 4px)",
                    color: "var(--token-color-text, #1f2937)",
                    textAlign: "left",
                    fontSize: "var(--token-typography-font-size-sm, 0.875rem)",
                    cursor: "pointer",
                  }}
                  role="menuitem"
                >
                  {item.icon && <span style={{ marginRight: "var(--token-spacing-space2, 0.5rem)" }}>{item.icon}</span>}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CSS Generation
// ============================================================================

export function generateUserMenuCSS(): string {
  return `
.user-menu-trigger:hover {
  background-color: var(--token-color-surface-hover, #f3f4f6);
}

.user-menu-item:hover {
  background-color: var(--token-color-surface-hover, #f3f4f6);
}

.user-menu-item-danger:hover {
  background-color: var(--token-color-error-light, #fef2f2);
}

/* Animation */
@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-menu-dropdown {
  animation: dropdownFadeIn 0.15s ease;
}
`.trim();
}
