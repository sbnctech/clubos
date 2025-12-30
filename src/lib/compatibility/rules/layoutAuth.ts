/**
 * Layout + Auth Compatibility Rules
 *
 * Rules governing which auth positions work with which layouts.
 *
 * Charter: P4 (no hidden rules), P6 (human-first UI)
 *
 * @see docs/design/AUTH_UI.md
 * @see docs/design/COMPATIBILITY_SYSTEM.md
 */

import type { CompatibilityRule } from "../types";

/**
 * Layout + Auth compatibility rules.
 *
 * Key constraints:
 * - Bottom-left auth requires a left sidebar (portal, dashboard, intranet)
 * - Classic and magazine layouts only support top-right auth
 * - Focus layout supports top-right and header auth
 */
export const layoutAuthRules: CompatibilityRule[] = [
  // ============================================================================
  // Bottom-Left Auth Position
  // ============================================================================
  {
    id: "auth-bottom-left-requires-sidebar",
    domain: "layout-auth",
    type: "requires",
    severity: "error",
    subject: "auth:bottom-left",
    requires: "layout:has-left-sidebar",
    message: "Bottom-left login menu requires a layout with left navigation.",
    fixAction: "Switch to a layout with left sidebar",
    fixTarget: "layout:portal",
    description: "The bottom-left auth position (app-style, like Linear/Notion) needs a left sidebar to display in.",
  },

  // ============================================================================
  // Soft Recommendations
  // ============================================================================
  {
    id: "dashboard-suggests-bottom-left-auth",
    domain: "layout-auth",
    type: "suggests",
    severity: "info",
    subject: "layout:dashboard",
    suggests: "auth:bottom-left",
    message: "Dashboard layout works best with bottom-left auth position for an app-like feel.",
    description: "Modern dashboard UIs typically place user info at the bottom of the sidebar.",
  },

  {
    id: "intranet-suggests-bottom-left-auth",
    domain: "layout-auth",
    type: "suggests",
    severity: "info",
    subject: "layout:intranet",
    suggests: "auth:bottom-left",
    message: "Intranet layout works best with bottom-left auth position.",
    description: "Rich intranet layouts benefit from app-style sidebar auth.",
  },
];

export default layoutAuthRules;
