/**
 * Mobile Navigation Component
 *
 * Slide-out drawer navigation for mobile devices.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import { useEffect, useCallback, useState } from "react";
import type { CSSProperties } from "react";
import type { NavItem, MobileNavProps } from "../shells/types";

// ============================================================================
// Component
// ============================================================================

export function MobileNav({
  items,
  isOpen,
  onClose,
  authUI,
  className,
}: MobileNavProps) {
  // Track expanded sections
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

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const overlayStyles: CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? "visible" : "hidden",
    transition: "opacity 0.3s ease, visibility 0.3s ease",
  };

  const drawerStyles: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "280px",
    maxWidth: "85vw",
    backgroundColor: "var(--token-color-background, #fff)",
    zIndex: 1000,
    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
    transition: "transform 0.3s ease",
    display: "flex",
    flexDirection: "column",
    boxShadow: "var(--token-shape-shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1))",
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="mobile-nav-overlay"
        style={overlayStyles}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`mobile-nav ${className || ""}`}
        style={drawerStyles}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header with close button */}
        <div
          className="mobile-nav-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--token-spacing-space3, 0.75rem) var(--token-spacing-space4, 1rem)",
            borderBottom: "1px solid var(--token-color-border, #e5e5e5)",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "var(--token-typography-font-size-lg, 1.125rem)",
            }}
          >
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="mobile-nav-close"
            style={{
              padding: "var(--token-spacing-space2, 0.5rem)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              lineHeight: 1,
              color: "var(--token-color-text-muted, #6b7280)",
            }}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {/* Navigation items */}
        <nav
          className="mobile-nav-items"
          style={{
            flex: 1,
            overflow: "auto",
            padding: "var(--token-spacing-space3, 0.75rem)",
          }}
        >
          {items.map((item) => (
            <MobileNavItem
              key={item.id}
              item={item}
              isExpanded={expandedSections.has(item.id)}
              onToggle={() => toggleSection(item.id)}
              onClose={onClose}
            />
          ))}
        </nav>

        {/* Auth UI */}
        {authUI && (
          <div
            className="mobile-nav-auth"
            style={{
              padding: "var(--token-spacing-space4, 1rem)",
              borderTop: "1px solid var(--token-color-border, #e5e5e5)",
            }}
          >
            {authUI}
          </div>
        )}
      </div>
    </>
  );
}

// ============================================================================
// Nav Item Component
// ============================================================================

interface MobileNavItemProps {
  item: NavItem;
  isExpanded?: boolean;
  onToggle?: () => void;
  onClose: () => void;
  depth?: number;
}

function MobileNavItem({
  item,
  isExpanded = false,
  onToggle,
  onClose,
  depth = 0,
}: MobileNavItemProps) {
  const hasChildren = item.children && item.children.length > 0;

  const linkStyles: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--token-spacing-space3, 0.75rem)",
    padding: "var(--token-spacing-space3, 0.75rem) var(--token-spacing-space4, 1rem)",
    paddingLeft: `calc(var(--token-spacing-space4, 1rem) + ${depth * 16}px)`,
    color: item.isActive
      ? "var(--token-color-primary, #2563eb)"
      : "var(--token-color-text, #1f2937)",
    textDecoration: "none",
    borderRadius: "var(--token-shape-radius-md, 6px)",
    backgroundColor: item.isActive ? "var(--token-color-primary-light, #eff6ff)" : "transparent",
    fontWeight: item.isActive ? 500 : 400,
    fontSize: "var(--token-typography-font-size-base, 1rem)",
    transition: "background-color 0.15s ease",
    width: "100%",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  };

  // Item with children
  if (hasChildren) {
    return (
      <div className="mobile-nav-item mobile-nav-item-section">
        <button
          type="button"
          className="mobile-nav-link"
          style={{ ...linkStyles, background: "none" }}
          onClick={onToggle}
          aria-expanded={isExpanded}
        >
          {item.icon && <span className="mobile-nav-icon">{item.icon}</span>}
          <span style={{ flex: 1 }}>{item.label}</span>
          <span
            className="mobile-nav-arrow"
            style={{
              transition: "transform 0.2s ease",
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            ▶
          </span>
        </button>

        {isExpanded && (
          <div className="mobile-nav-children">
            {item.children!.map((child) => (
              <MobileNavItem
                key={child.id}
                item={child}
                onClose={onClose}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular link
  return (
    <div className="mobile-nav-item">
      <a
        href={item.href}
        className="mobile-nav-link"
        style={linkStyles}
        target={item.isExternal ? "_blank" : undefined}
        rel={item.isExternal ? "noopener noreferrer" : undefined}
        onClick={onClose}
        aria-current={item.isActive ? "page" : undefined}
      >
        {item.icon && <span className="mobile-nav-icon">{item.icon}</span>}
        <span>{item.label}</span>
        {item.isExternal && <span className="mobile-nav-external">↗</span>}
      </a>
    </div>
  );
}

// ============================================================================
// CSS Generation
// ============================================================================

export function generateMobileNavCSS(): string {
  return `
.mobile-nav-link:hover,
.mobile-nav-link:focus {
  background-color: var(--token-color-surface-hover, #f3f4f6);
}

.mobile-nav-link:active {
  background-color: var(--token-color-surface-active, #e5e7eb);
}

/* Animation */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.mobile-nav[data-entering] {
  animation: slideIn 0.3s ease;
}

.mobile-nav-overlay[data-entering] {
  animation: fadeIn 0.3s ease;
}
`.trim();
}
