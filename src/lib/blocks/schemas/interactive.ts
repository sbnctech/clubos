/**
 * Interactive Block Schemas
 *
 * Schemas for interactive blocks: button, button-group, form, interactive-calendar, map, search.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

import { z } from "zod";
import { type BlockDefinition } from "../types";
import { createBlockSchema, createBlockSchemaWithComplexData } from "./helpers";

// ============================================================================
// Button Block
// ============================================================================

export const buttonBlockDataSchema = z.object({
  /** Button text */
  text: z.string().default("Click here"),

  /** Link URL */
  url: z.string().url().or(z.literal("")),

  /** Open in new tab */
  newTab: z.boolean().default(false),

  /** Button variant */
  variant: z.enum(["primary", "secondary", "outline", "ghost", "link"]).default("primary"),

  /** Button size */
  size: z.enum(["sm", "md", "lg"]).default("md"),

  /** Button alignment */
  align: z.enum(["left", "center", "right", "full"]).default("left"),

  /** Icon name (before text) */
  iconLeft: z.string().optional(),

  /** Icon name (after text) */
  iconRight: z.string().optional(),

  /** Disabled state */
  disabled: z.boolean().default(false),
});

export type ButtonBlockData = z.infer<typeof buttonBlockDataSchema>;

export const buttonBlockSchema = createBlockSchema("button", buttonBlockDataSchema);

export type ButtonBlock = z.infer<typeof buttonBlockSchema>;

export const buttonBlockDefinition: BlockDefinition<ButtonBlock> = {
  type: "button",
  name: "Button",
  description: "Call-to-action button",
  category: "interactive",
  icon: "mouse-pointer-click",
  schema: buttonBlockSchema,
  defaultData: {
    text: "Click here",
    url: "",
    newTab: false,
    variant: "primary",
    size: "md",
    align: "left",
    disabled: false,
  },
  isContainer: false,
  emailCompatible: true, // Buttons work in email as styled links
  keywords: ["button", "cta", "action", "link"],
  version: 1,
};

// ============================================================================
// Button Group Block
// ============================================================================

export const buttonGroupItemSchema = z.object({
  /** Button text */
  text: z.string(),

  /** Link URL */
  url: z.string().url().or(z.literal("")),

  /** Open in new tab */
  newTab: z.boolean().default(false),

  /** Button variant */
  variant: z.enum(["primary", "secondary", "outline", "ghost", "link"]).default("secondary"),

  /** Icon name */
  icon: z.string().optional(),
});

export type ButtonGroupItem = z.infer<typeof buttonGroupItemSchema>;

export const buttonGroupBlockDataSchema = z.object({
  /** Buttons in the group */
  buttons: z.array(buttonGroupItemSchema).default([]),

  /** Group alignment */
  align: z.enum(["left", "center", "right", "stretch"]).default("left"),

  /** Button size */
  size: z.enum(["sm", "md", "lg"]).default("md"),

  /** Gap between buttons */
  gap: z.enum(["none", "sm", "md", "lg"]).default("sm"),

  /** Stack vertically on mobile */
  stackOnMobile: z.boolean().default(true),
});

export type ButtonGroupBlockData = z.infer<typeof buttonGroupBlockDataSchema>;

export const buttonGroupBlockSchema = createBlockSchema("button-group", buttonGroupBlockDataSchema);

export type ButtonGroupBlock = z.infer<typeof buttonGroupBlockSchema>;

export const buttonGroupBlockDefinition: BlockDefinition<ButtonGroupBlock> = {
  type: "button-group",
  name: "Button Group",
  description: "Multiple buttons in a row",
  category: "interactive",
  icon: "layout-list",
  schema: buttonGroupBlockSchema,
  defaultData: {
    buttons: [],
    align: "left",
    size: "md",
    gap: "sm",
    stackOnMobile: true,
  },
  isContainer: false,
  emailCompatible: true,
  keywords: ["buttons", "group", "actions"],
  version: 1,
};

// ============================================================================
// Form Block
// ============================================================================

export const formFieldSchema = z.object({
  /** Field ID */
  id: z.string(),

  /** Field type */
  type: z.enum([
    "text",
    "email",
    "phone",
    "number",
    "textarea",
    "select",
    "radio",
    "checkbox",
    "date",
    "time",
    "file",
    "hidden",
  ]),

  /** Field label */
  label: z.string(),

  /** Placeholder text */
  placeholder: z.string().optional(),

  /** Helper text */
  helperText: z.string().optional(),

  /** Required field */
  required: z.boolean().default(false),

  /** Default value */
  defaultValue: z.string().optional(),

  /** Options (for select, radio, checkbox) */
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),

  /** Validation pattern (regex) */
  pattern: z.string().optional(),

  /** Min value/length */
  min: z.number().optional(),

  /** Max value/length */
  max: z.number().optional(),

  /** Field width */
  width: z.enum(["full", "half", "third"]).default("full"),
});

export type FormField = z.infer<typeof formFieldSchema>;

export const formBlockDataSchema = z.object({
  /** Form fields */
  fields: z.array(formFieldSchema).default([]),

  /** Submit button text */
  submitText: z.string().default("Submit"),

  /** Success message */
  successMessage: z.string().default("Thank you for your submission!"),

  /** Error message */
  errorMessage: z.string().default("There was an error. Please try again."),

  /** Form action URL (for external handlers) */
  actionUrl: z.string().url().optional(),

  /** Form method */
  method: z.enum(["POST", "GET"]).default("POST"),

  /** Enable honeypot spam protection */
  honeypot: z.boolean().default(true),

  /** Redirect URL after success */
  redirectUrl: z.string().url().optional(),
});

export type FormBlockData = z.infer<typeof formBlockDataSchema>;

export const formBlockSchema = createBlockSchema("form", formBlockDataSchema);

export type FormBlock = z.infer<typeof formBlockSchema>;

export const formBlockDefinition: BlockDefinition<FormBlock> = {
  type: "form",
  name: "Form",
  description: "Contact or signup form",
  category: "interactive",
  icon: "file-text",
  schema: formBlockSchema,
  defaultData: {
    fields: [],
    submitText: "Submit",
    successMessage: "Thank you for your submission!",
    errorMessage: "There was an error. Please try again.",
    method: "POST",
    honeypot: true,
  },
  isContainer: false,
  emailCompatible: false, // Forms don't work in email
  keywords: ["form", "contact", "signup", "input"],
  version: 1,
};

// ============================================================================
// Interactive Calendar Block
// ============================================================================

export const interactiveCalendarBlockDataSchema = z.object({
  /** Calendar view */
  view: z.enum(["month", "week", "day", "agenda"]).default("month"),

  /** Event source (API endpoint or static) */
  eventSource: z.enum(["api", "static"]).default("api"),

  /** Static events (if eventSource is static) */
  staticEvents: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        start: z.string(), // ISO date string
        end: z.string().optional(),
        allDay: z.boolean().default(false),
        url: z.string().url().optional(),
        color: z.string().optional(),
      })
    )
    .optional(),

  /** Category filter (show only specific categories) */
  categoryFilter: z.array(z.string()).optional(),

  /** Show navigation controls */
  showNavigation: z.boolean().default(true),

  /** Show view switcher */
  showViewSwitcher: z.boolean().default(true),

  /** Week starts on */
  weekStartsOn: z.enum(["sunday", "monday"]).default("sunday"),

  /** Height */
  height: z.string().default("600px"),
});

export type InteractiveCalendarBlockData = z.infer<typeof interactiveCalendarBlockDataSchema>;

export const interactiveCalendarBlockSchema = createBlockSchemaWithComplexData(
  "interactive-calendar",
  interactiveCalendarBlockDataSchema
);

export type InteractiveCalendarBlock = z.infer<typeof interactiveCalendarBlockSchema>;

export const interactiveCalendarBlockDefinition: BlockDefinition<InteractiveCalendarBlock> = {
  type: "interactive-calendar",
  name: "Calendar",
  description: "Interactive event calendar",
  category: "interactive",
  icon: "calendar",
  schema: interactiveCalendarBlockSchema,
  defaultData: {
    view: "month",
    eventSource: "api",
    showNavigation: true,
    showViewSwitcher: true,
    weekStartsOn: "sunday",
    height: "600px",
  },
  isContainer: false,
  emailCompatible: false, // Interactive calendars don't work in email
  keywords: ["calendar", "events", "schedule"],
  version: 1,
};

// ============================================================================
// Map Block
// ============================================================================

export const mapMarkerSchema = z.object({
  /** Marker ID */
  id: z.string(),

  /** Latitude */
  lat: z.number(),

  /** Longitude */
  lng: z.number(),

  /** Marker title */
  title: z.string().optional(),

  /** Popup content */
  popup: z.string().optional(),
});

export type MapMarker = z.infer<typeof mapMarkerSchema>;

export const mapBlockDataSchema = z.object({
  /** Map provider */
  provider: z.enum(["google", "mapbox", "leaflet"]).default("leaflet"),

  /** Center latitude */
  centerLat: z.number().default(37.7749),

  /** Center longitude */
  centerLng: z.number().default(-122.4194),

  /** Zoom level */
  zoom: z.number().int().min(1).max(22).default(13),

  /** Map markers */
  markers: z.array(mapMarkerSchema).default([]),

  /** Map height */
  height: z.string().default("400px"),

  /** Show zoom controls */
  showZoomControls: z.boolean().default(true),

  /** Enable scroll wheel zoom */
  scrollWheelZoom: z.boolean().default(false),

  /** Enable dragging */
  draggable: z.boolean().default(true),

  /** Map style (for supported providers) */
  style: z.string().optional(),
});

export type MapBlockData = z.infer<typeof mapBlockDataSchema>;

export const mapBlockSchema = createBlockSchema("map", mapBlockDataSchema);

export type MapBlock = z.infer<typeof mapBlockSchema>;

export const mapBlockDefinition: BlockDefinition<MapBlock> = {
  type: "map",
  name: "Map",
  description: "Interactive map with markers",
  category: "interactive",
  icon: "map-pin",
  schema: mapBlockSchema,
  defaultData: {
    provider: "leaflet",
    centerLat: 37.7749,
    centerLng: -122.4194,
    zoom: 13,
    markers: [],
    height: "400px",
    showZoomControls: true,
    scrollWheelZoom: false,
    draggable: true,
  },
  isContainer: false,
  emailCompatible: false, // Maps don't work in email
  keywords: ["map", "location", "directions", "markers"],
  version: 1,
};

// ============================================================================
// Search Block
// ============================================================================

export const searchBlockDataSchema = z.object({
  /** Placeholder text */
  placeholder: z.string().default("Search..."),

  /** Search scope */
  scope: z.enum(["all", "pages", "events", "members", "groups"]).default("all"),

  /** Show search suggestions */
  showSuggestions: z.boolean().default(true),

  /** Button text */
  buttonText: z.string().optional(),

  /** Show button (or search on type) */
  showButton: z.boolean().default(false),

  /** Search style */
  style: z.enum(["default", "minimal", "expanded"]).default("default"),

  /** Size */
  size: z.enum(["sm", "md", "lg"]).default("md"),
});

export type SearchBlockData = z.infer<typeof searchBlockDataSchema>;

export const searchBlockSchema = createBlockSchema("search", searchBlockDataSchema);

export type SearchBlock = z.infer<typeof searchBlockSchema>;

export const searchBlockDefinition: BlockDefinition<SearchBlock> = {
  type: "search",
  name: "Search",
  description: "Site search input",
  category: "interactive",
  icon: "search",
  schema: searchBlockSchema,
  defaultData: {
    placeholder: "Search...",
    scope: "all",
    showSuggestions: true,
    showButton: false,
    style: "default",
    size: "md",
  },
  isContainer: false,
  emailCompatible: false, // Search doesn't work in email
  keywords: ["search", "find", "lookup"],
  version: 1,
};

// ============================================================================
// Exports
// ============================================================================

export const interactiveBlockDefinitions = [
  buttonBlockDefinition,
  buttonGroupBlockDefinition,
  formBlockDefinition,
  interactiveCalendarBlockDefinition,
  mapBlockDefinition,
  searchBlockDefinition,
];
