/**
 * Auth Corner Component
 *
 * Top-right auth UI showing login button or user menu.
 * Traditional web app placement.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import type { CSSProperties } from "react";
import type { AuthCornerProps } from "../shells/types";
import { UserMenu } from "./UserMenu";
import { UserAvatar } from "./UserAvatar";

// ============================================================================
// Component
// ============================================================================

export function AuthCorner({
  isAuthenticated,
  user,
  onLogin,
  onLogout,
  isPreview = false,
  className,
}: AuthCornerProps) {
  // Don't render in preview mode
  if (isPreview) {
    return null;
  }

  const containerStyles: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--token-spacing-space2, 0.5rem)",
  };

  // Not authenticated - show login button
  if (!isAuthenticated) {
    return (
      <div className={`auth-corner auth-corner-guest ${className || ""}`} style={containerStyles}>
        <button
          type="button"
          onClick={onLogin}
          className="auth-corner-login"
          style={{
            padding: "var(--token-spacing-space2, 0.5rem) var(--token-spacing-space4, 1rem)",
            backgroundColor: "var(--token-color-primary, #2563eb)",
            color: "var(--token-color-text-inverse, #fff)",
            border: "none",
            borderRadius: "var(--token-shape-radius-md, 6px)",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background-color 0.15s ease",
          }}
        >
          Log In
        </button>
      </div>
    );
  }

  // Authenticated - show user menu
  if (!user) {
    return null;
  }

  return (
    <div className={`auth-corner auth-corner-user ${className || ""}`} style={containerStyles}>
      <UserMenu user={user} onLogout={onLogout} />
    </div>
  );
}

// ============================================================================
// Compact Variant (just avatar)
// ============================================================================

export interface AuthCornerCompactProps extends AuthCornerProps {
  showName?: boolean;
}

export function AuthCornerCompact({
  isAuthenticated,
  user,
  onLogin,
  onLogout: _onLogout,
  isPreview = false,
  showName = false,
  className,
}: AuthCornerCompactProps) {
  if (isPreview) {
    return null;
  }

  const containerStyles: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--token-spacing-space2, 0.5rem)",
  };

  if (!isAuthenticated) {
    return (
      <div className={`auth-corner-compact auth-corner-guest ${className || ""}`} style={containerStyles}>
        <button
          type="button"
          onClick={onLogin}
          className="auth-corner-login"
          style={{
            padding: "var(--token-spacing-space2, 0.5rem)",
            backgroundColor: "transparent",
            color: "var(--token-color-primary, #2563eb)",
            border: "1px solid var(--token-color-primary, #2563eb)",
            borderRadius: "var(--token-shape-radius-md, 6px)",
            fontWeight: 500,
            cursor: "pointer",
            fontSize: "var(--token-typography-font-size-sm, 0.875rem)",
          }}
        >
          Log In
        </button>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`auth-corner-compact auth-corner-user ${className || ""}`} style={containerStyles}>
      {showName && (
        <span
          style={{
            fontSize: "var(--token-typography-font-size-sm, 0.875rem)",
            color: "var(--token-color-text-muted, #6b7280)",
          }}
        >
          {user.displayName}
        </span>
      )}
      <UserAvatar user={user} size="sm" />
    </div>
  );
}

// ============================================================================
// CSS Generation
// ============================================================================

export function generateAuthCornerCSS(): string {
  return `
.auth-corner {
  display: flex;
  align-items: center;
  gap: var(--token-spacing-space2, 0.5rem);
}

.auth-corner-login:hover {
  background-color: var(--token-color-primary-dark, #1d4ed8);
}

.auth-corner-login:focus {
  outline: 2px solid var(--token-color-primary, #2563eb);
  outline-offset: 2px;
}

.auth-corner-compact .auth-corner-login:hover {
  background-color: var(--token-color-primary-light, #eff6ff);
}
`.trim();
}
