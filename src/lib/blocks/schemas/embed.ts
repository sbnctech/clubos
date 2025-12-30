/**
 * Embed Block Schemas
 *
 * Schemas for embed blocks: html, iframe, social-embed.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

import { z } from "zod";
import { type BlockDefinition } from "../types";
import { createBlockSchema } from "./helpers";

// ============================================================================
// HTML Block
// ============================================================================

export const htmlBlockDataSchema = z.object({
  /** Raw HTML content */
  html: z.string().default(""),

  /** Whether to sanitize HTML (recommended true) */
  sanitize: z.boolean().default(true),

  /** Allowed tags (when sanitized) */
  allowedTags: z.array(z.string()).optional(),

  /** Allowed attributes (when sanitized) */
  allowedAttributes: z.record(z.string(), z.array(z.string())).optional(),
});

export type HtmlBlockData = z.infer<typeof htmlBlockDataSchema>;

export const htmlBlockSchema = createBlockSchema("html", htmlBlockDataSchema);

export type HtmlBlock = z.infer<typeof htmlBlockSchema>;

export const htmlBlockDefinition: BlockDefinition<HtmlBlock> = {
  type: "html",
  name: "HTML",
  description: "Custom HTML content",
  category: "embed",
  icon: "code",
  schema: htmlBlockSchema,
  defaultData: {
    html: "",
    sanitize: true,
  },
  isContainer: false,
  emailCompatible: true, // Basic HTML works in email
  keywords: ["html", "code", "custom", "embed"],
  version: 1,
};

// ============================================================================
// Iframe Block
// ============================================================================

export const iframeBlockDataSchema = z.object({
  /** Iframe source URL */
  src: z.string().url().or(z.literal("")),

  /** Iframe title (for accessibility) */
  title: z.string().default("Embedded content"),

  /** Width (CSS value) */
  width: z.string().default("100%"),

  /** Height (CSS value) */
  height: z.string().default("400px"),

  /** Aspect ratio (alternative to fixed height) */
  aspectRatio: z.enum(["16:9", "4:3", "1:1", "9:16", "custom"]).optional(),

  /** Allow fullscreen */
  allowFullscreen: z.boolean().default(true),

  /** Sandbox options */
  sandbox: z
    .array(
      z.enum([
        "allow-forms",
        "allow-modals",
        "allow-orientation-lock",
        "allow-pointer-lock",
        "allow-popups",
        "allow-popups-to-escape-sandbox",
        "allow-presentation",
        "allow-same-origin",
        "allow-scripts",
        "allow-storage-access-by-user-activation",
        "allow-top-navigation",
        "allow-top-navigation-by-user-activation",
      ])
    )
    .default(["allow-scripts", "allow-same-origin"]),

  /** Loading behavior */
  loading: z.enum(["lazy", "eager"]).default("lazy"),

  /** Border */
  border: z.boolean().default(false),

  /** Border radius */
  borderRadius: z.enum(["none", "sm", "md", "lg"]).default("none"),
});

export type IframeBlockData = z.infer<typeof iframeBlockDataSchema>;

export const iframeBlockSchema = createBlockSchema("iframe", iframeBlockDataSchema);

export type IframeBlock = z.infer<typeof iframeBlockSchema>;

export const iframeBlockDefinition: BlockDefinition<IframeBlock> = {
  type: "iframe",
  name: "Iframe",
  description: "Embedded external content",
  category: "embed",
  icon: "frame",
  schema: iframeBlockSchema,
  defaultData: {
    src: "",
    title: "Embedded content",
    width: "100%",
    height: "400px",
    allowFullscreen: true,
    sandbox: ["allow-scripts", "allow-same-origin"],
    loading: "lazy",
    border: false,
    borderRadius: "none",
  },
  isContainer: false,
  emailCompatible: false, // Iframes don't work in email
  keywords: ["iframe", "embed", "external", "widget"],
  version: 1,
};

// ============================================================================
// Social Embed Block
// ============================================================================

export const socialEmbedBlockDataSchema = z.object({
  /** Platform */
  platform: z
    .enum([
      "twitter",
      "facebook",
      "instagram",
      "linkedin",
      "youtube",
      "tiktok",
      "threads",
      "bluesky",
    ])
    .default("twitter"),

  /** Post URL or ID */
  url: z.string().url().or(z.literal("")),

  /** Post ID (extracted from URL) */
  postId: z.string().optional(),

  /** Embed width */
  width: z.string().default("100%"),

  /** Max width */
  maxWidth: z.string().default("550px"),

  /** Alignment */
  align: z.enum(["left", "center", "right"]).default("center"),

  /** Show conversation/replies (Twitter) */
  showConversation: z.boolean().default(false),

  /** Theme */
  theme: z.enum(["light", "dark", "auto"]).default("auto"),
});

export type SocialEmbedBlockData = z.infer<typeof socialEmbedBlockDataSchema>;

export const socialEmbedBlockSchema = createBlockSchema("social-embed", socialEmbedBlockDataSchema);

export type SocialEmbedBlock = z.infer<typeof socialEmbedBlockSchema>;

export const socialEmbedBlockDefinition: BlockDefinition<SocialEmbedBlock> = {
  type: "social-embed",
  name: "Social Post",
  description: "Embedded social media post",
  category: "embed",
  icon: "share-2",
  schema: socialEmbedBlockSchema,
  defaultData: {
    platform: "twitter",
    url: "",
    width: "100%",
    maxWidth: "550px",
    align: "center",
    showConversation: false,
    theme: "auto",
  },
  isContainer: false,
  emailCompatible: false, // Social embeds don't work in email
  keywords: ["social", "twitter", "facebook", "instagram", "embed", "post"],
  version: 1,
};

// ============================================================================
// Exports
// ============================================================================

export const embedBlockDefinitions = [
  htmlBlockDefinition,
  iframeBlockDefinition,
  socialEmbedBlockDefinition,
];
