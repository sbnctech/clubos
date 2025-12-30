/**
 * Email Context Compatibility Rules
 *
 * Rules governing which blocks work in email context.
 * Email has strict limitations due to email client rendering differences.
 *
 * Charter: P4 (no hidden rules), P6 (human-first UI)
 *
 * @see docs/design/COMPATIBILITY_SYSTEM.md
 */

import type { CompatibilityRule } from "../types";

/**
 * Email context compatibility rules.
 *
 * Key constraints:
 * - No interactive blocks (JavaScript not supported)
 * - No forms (can't submit from email)
 * - No video embeds (not supported)
 * - Limited layout options (max 2 columns)
 * - Images should be under 600px width
 */
export const emailContextRules: CompatibilityRule[] = [
  // ============================================================================
  // Email Allowed Blocks (main restricts rule)
  // ============================================================================
  {
    id: "email-allowed-blocks",
    domain: "email-context",
    type: "restricts",
    severity: "error",
    subject: "context:email",
    allows: [
      "block:text",
      "block:heading",
      "block:paragraph",
      "block:image",
      "block:button",
      "block:divider",
      "block:spacer",
      "block:columns", // Simple 2-column only
      "block:event-list-static",
      "block:member-greeting",
      "block:quote",
      "block:list",
    ],
    message: "This block type is not supported in emails.",
    description: "Email clients have limited rendering capabilities.",
  },

  // ============================================================================
  // Interactive Blocks - Explicit Exclusions
  // ============================================================================
  {
    id: "email-no-interactive-calendar",
    domain: "email-context",
    type: "excludes",
    severity: "error",
    subject: "block:interactive-calendar",
    excludes: "context:email",
    message: "Interactive calendar cannot be used in emails. Use a static event list instead.",
    fixAction: "Replace with Event List block",
    fixTarget: "block:event-list-static",
    contexts: ["email"],
    description: "Interactive calendars require JavaScript which is not supported in email clients.",
  },

  {
    id: "email-no-calendar-widget",
    domain: "email-context",
    type: "excludes",
    severity: "error",
    subject: "block:calendar-mini",
    excludes: "context:email",
    message: "Calendar widgets cannot be used in emails.",
    fixAction: "Replace with Event List block",
    fixTarget: "block:event-list-static",
    contexts: ["email"],
    description: "Calendar widgets require JavaScript.",
  },

  {
    id: "email-no-accordion",
    domain: "email-context",
    type: "excludes",
    severity: "error",
    subject: "block:accordion",
    excludes: "context:email",
    message: "Accordions cannot be used in emails.",
    fixAction: "Use separate sections instead",
    contexts: ["email"],
    description: "Accordions require JavaScript for expand/collapse functionality.",
  },

  {
    id: "email-no-tabs",
    domain: "email-context",
    type: "excludes",
    severity: "error",
    subject: "block:tabs",
    excludes: "context:email",
    message: "Tabs cannot be used in emails.",
    fixAction: "Use separate sections instead",
    contexts: ["email"],
    description: "Tabs require JavaScript for switching.",
  },

  {
    id: "email-no-carousel",
    domain: "email-context",
    type: "excludes",
    severity: "error",
    subject: "block:carousel",
    excludes: "context:email",
    message: "Carousels cannot be used in emails.",
    fixAction: "Use a single image or static image grid",
    contexts: ["email"],
    description: "Carousels require JavaScript for sliding.",
  },

  // ============================================================================
  // Forms
  // ============================================================================
  {
    id: "email-no-forms",
    domain: "email-context",
    type: "excludes",
    severity: "error",
    subject: "block:form",
    excludes: "context:email",
    message: "Forms cannot be embedded in emails. Link to a form page instead.",
    fixAction: "Replace with a Button linking to the form",
    fixTarget: "block:button",
    contexts: ["email"],
    description: "Form submissions from email are not reliably supported.",
  },

  {
    id: "email-no-rsvp-form",
    domain: "email-context",
    type: "excludes",
    severity: "error",
    subject: "block:rsvp-form",
    excludes: "context:email",
    message: "RSVP forms cannot be used in emails. Link to the event page instead.",
    fixAction: "Replace with a Button linking to the event",
    fixTarget: "block:button",
    contexts: ["email"],
    description: "Form submissions from email are not supported.",
  },

  // ============================================================================
  // Embeds
  // ============================================================================
  {
    id: "email-no-video",
    domain: "email-context",
    type: "excludes",
    severity: "error",
    subject: "block:video",
    excludes: "context:email",
    message: "Videos cannot be embedded in emails. Use an image with a play button linking to the video.",
    fixAction: "Replace with an image that links to the video",
    contexts: ["email"],
    description: "Video embedding is not supported by email clients.",
  },

  {
    id: "email-no-map",
    domain: "email-context",
    type: "excludes",
    severity: "error",
    subject: "block:map",
    excludes: "context:email",
    message: "Maps cannot be embedded in emails. Use a static image or link instead.",
    fixAction: "Replace with an image or link to Google Maps",
    contexts: ["email"],
    description: "Interactive maps are not supported in email clients.",
  },

  {
    id: "email-no-social-embed",
    domain: "email-context",
    type: "excludes",
    severity: "error",
    subject: "block:social-embed",
    excludes: "context:email",
    message: "Social embeds cannot be used in emails.",
    contexts: ["email"],
    description: "Social embeds require JavaScript and iframes.",
  },

  // ============================================================================
  // Complex Blocks
  // ============================================================================
  {
    id: "email-no-member-directory",
    domain: "email-context",
    type: "excludes",
    severity: "error",
    subject: "block:member-directory",
    excludes: "context:email",
    message: "Member directory cannot be used in emails.",
    contexts: ["email"],
    description: "Member directory is too dynamic for email.",
  },

  {
    id: "email-no-gallery",
    domain: "email-context",
    type: "excludes",
    severity: "error",
    subject: "block:gallery",
    excludes: "context:email",
    message: "Galleries cannot be used in emails. Use individual images instead.",
    fixAction: "Use multiple Image blocks instead",
    contexts: ["email"],
    description: "Interactive galleries are not supported.",
  },

  // ============================================================================
  // Warnings (Soft Constraints)
  // ============================================================================
  {
    id: "email-image-width-warning",
    domain: "email-context",
    type: "suggests",
    severity: "warning",
    subject: "block:image",
    suggests: "image:max-width-600",
    message: "Images wider than 600px may not display correctly in all email clients.",
    fixAction: "Resize image to 600px width",
    contexts: ["email"],
    description: "Many email clients have narrow viewports.",
  },

  {
    id: "email-columns-max-two",
    domain: "email-context",
    type: "suggests",
    severity: "warning",
    subject: "block:columns",
    suggests: "columns:max-two",
    message: "Email supports maximum 2 columns. More columns may not display correctly.",
    contexts: ["email"],
    description: "Email table-based layouts work best with 2 columns max.",
  },
];

export default emailContextRules;
