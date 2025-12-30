/**
 * Murmurant Templates
 *
 * Canonical page templates for member and admin surfaces,
 * plus layout shells and navigation components.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

// Member templates
export {
  MemberShell,
  MemberHomeTemplate,
  MemberContentTemplate,
} from "./member";

// Admin templates
export {
  AdminShell,
  AdminListTemplate,
  AdminDetailTemplate,
} from "./admin";

// Layout Shells
export * from "./shells";

// Navigation Components
export * from "./nav";

// Auth UI Components
export * from "./auth";
