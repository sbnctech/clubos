/**
 * User Avatar Component
 *
 * Displays user avatar image or initials fallback.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import { useState, useMemo } from "react";
import type { CSSProperties } from "react";
import type { UserAvatarProps, ShellUser } from "../shells/types";

// ============================================================================
// Component
// ============================================================================

export function UserAvatar({
  user,
  size = "md",
  showStatus = false,
  className,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Size mappings
  const sizeMap = {
    sm: 28,
    md: 36,
    lg: 48,
  };

  const dimension = sizeMap[size];

  // Get initials from user
  const initials = useMemo(() => {
    if (user.initials) {
      return user.initials;
    }
    const parts = user.displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }, [user.displayName, user.initials]);

  // Generate background color from name (deterministic)
  const backgroundColor = useMemo(() => {
    const colors = [
      "#f87171", // red-400
      "#fb923c", // orange-400
      "#fbbf24", // amber-400
      "#a3e635", // lime-400
      "#4ade80", // green-400
      "#2dd4bf", // teal-400
      "#22d3ee", // cyan-400
      "#60a5fa", // blue-400
      "#a78bfa", // violet-400
      "#f472b6", // pink-400
    ];
    let hash = 0;
    for (let i = 0; i < user.displayName.length; i++) {
      hash = user.displayName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, [user.displayName]);

  const containerStyles: CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: dimension,
    height: dimension,
    borderRadius: "50%",
    overflow: "hidden",
    flexShrink: 0,
  };

  const showImage = user.avatarUrl && !imageError;

  return (
    <div
      className={`user-avatar user-avatar-${size} ${className || ""}`}
      style={containerStyles}
      title={user.displayName}
    >
      {showImage ? (
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          onError={() => setImageError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          className="user-avatar-initials"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor,
            color: "#fff",
            fontWeight: 500,
            fontSize: size === "sm" ? "0.75rem" : size === "md" ? "0.875rem" : "1rem",
            textTransform: "uppercase",
          }}
        >
          {initials}
        </div>
      )}

      {/* Online status indicator */}
      {showStatus && (
        <span
          className="user-avatar-status"
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: size === "sm" ? 8 : size === "md" ? 10 : 12,
            height: size === "sm" ? 8 : size === "md" ? 10 : 12,
            backgroundColor: "#22c55e", // green-500
            borderRadius: "50%",
            border: "2px solid var(--token-color-background, #fff)",
          }}
          aria-label="Online"
        />
      )}
    </div>
  );
}

// ============================================================================
// Avatar Group Component
// ============================================================================

export interface UserAvatarGroupProps {
  users: ShellUser[];
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatarGroup({
  users,
  max = 4,
  size = "md",
  className,
}: UserAvatarGroupProps) {
  const visibleUsers = users.slice(0, max);
  const overflowCount = users.length - max;

  const sizeMap = {
    sm: 28,
    md: 36,
    lg: 48,
  };
  const dimension = sizeMap[size];
  const overlap = dimension * 0.3;

  return (
    <div
      className={`user-avatar-group ${className || ""}`}
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        justifyContent: "flex-end",
      }}
    >
      {/* Overflow indicator */}
      {overflowCount > 0 && (
        <div
          className="user-avatar-overflow"
          style={{
            width: dimension,
            height: dimension,
            borderRadius: "50%",
            backgroundColor: "var(--token-color-surface, #f3f4f6)",
            border: "2px solid var(--token-color-background, #fff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size === "sm" ? "0.625rem" : "0.75rem",
            fontWeight: 500,
            color: "var(--token-color-text-muted, #6b7280)",
            marginLeft: -overlap,
            zIndex: 0,
          }}
        >
          +{overflowCount}
        </div>
      )}

      {/* Visible avatars */}
      {visibleUsers.map((user, index) => (
        <div
          key={user.id}
          style={{
            marginLeft: index === visibleUsers.length - 1 ? 0 : -overlap,
            zIndex: visibleUsers.length - index,
            border: "2px solid var(--token-color-background, #fff)",
            borderRadius: "50%",
          }}
        >
          <UserAvatar user={user} size={size} />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// CSS Generation
// ============================================================================

export function generateUserAvatarCSS(): string {
  return `
.user-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-initials {
  font-family: var(--token-typography-font-body, system-ui, sans-serif);
}

.user-avatar-group {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
}
`.trim();
}
