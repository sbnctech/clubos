/**
 * Media Block Schemas
 *
 * Schemas for media blocks: image, gallery, video, audio, file.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

import { z } from "zod";
import { type BlockDefinition } from "../types";
import { createBlockSchema } from "./helpers";

// ============================================================================
// Common Media Schemas
// ============================================================================

const mediaSizeSchema = z.object({
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

const mediaAlignSchema = z.enum(["left", "center", "right", "full"]);

// ============================================================================
// Image Block
// ============================================================================

export const imageBlockDataSchema = z.object({
  /** Image source URL */
  src: z.string().url().or(z.literal("")),

  /** Alt text for accessibility */
  alt: z.string().default(""),

  /** Image caption */
  caption: z.string().optional(),

  /** Link URL (makes image clickable) */
  link: z.string().url().optional(),

  /** Open link in new tab */
  linkNewTab: z.boolean().default(false),

  /** Image alignment */
  align: mediaAlignSchema.default("center"),

  /** Image size constraints */
  size: mediaSizeSchema.optional(),

  /** Border radius */
  borderRadius: z.enum(["none", "sm", "md", "lg", "full"]).default("none"),

  /** Shadow */
  shadow: z.enum(["none", "sm", "md", "lg"]).default("none"),

  /** Lazy loading */
  lazy: z.boolean().default(true),
});

export type ImageBlockData = z.infer<typeof imageBlockDataSchema>;

export const imageBlockSchema = createBlockSchema("image", imageBlockDataSchema);

export type ImageBlock = z.infer<typeof imageBlockSchema>;

export const imageBlockDefinition: BlockDefinition<ImageBlock> = {
  type: "image",
  name: "Image",
  description: "Single image with caption",
  category: "media",
  icon: "image",
  schema: imageBlockSchema,
  defaultData: {
    src: "",
    alt: "",
    align: "center",
    borderRadius: "none",
    shadow: "none",
    lazy: true,
    linkNewTab: false,
  },
  isContainer: false,
  emailCompatible: true,
  keywords: ["image", "photo", "picture", "graphic"],
  version: 1,
};

// ============================================================================
// Gallery Block
// ============================================================================

export const galleryImageSchema = z.object({
  /** Image source URL */
  src: z.string().url(),

  /** Alt text */
  alt: z.string().default(""),

  /** Caption */
  caption: z.string().optional(),

  /** Thumbnail URL (for optimization) */
  thumbnail: z.string().url().optional(),
});

export type GalleryImage = z.infer<typeof galleryImageSchema>;

export const galleryBlockDataSchema = z.object({
  /** Gallery images */
  images: z.array(galleryImageSchema).default([]),

  /** Layout style */
  layout: z.enum(["grid", "masonry", "slider", "lightbox"]).default("grid"),

  /** Columns (for grid layout) */
  columns: z.number().int().min(1).max(6).default(3),

  /** Gap between images */
  gap: z.enum(["none", "sm", "md", "lg"]).default("md"),

  /** Thumbnail size */
  thumbnailSize: z.enum(["sm", "md", "lg"]).default("md"),

  /** Enable lightbox */
  lightbox: z.boolean().default(true),
});

export type GalleryBlockData = z.infer<typeof galleryBlockDataSchema>;

export const galleryBlockSchema = createBlockSchema("gallery", galleryBlockDataSchema);

export type GalleryBlock = z.infer<typeof galleryBlockSchema>;

export const galleryBlockDefinition: BlockDefinition<GalleryBlock> = {
  type: "gallery",
  name: "Gallery",
  description: "Image gallery with multiple layouts",
  category: "media",
  icon: "images",
  schema: galleryBlockSchema,
  defaultData: {
    images: [],
    layout: "grid",
    columns: 3,
    gap: "md",
    thumbnailSize: "md",
    lightbox: true,
  },
  isContainer: false,
  emailCompatible: false, // Galleries don't work well in email
  keywords: ["gallery", "images", "photos", "slideshow"],
  version: 1,
};

// ============================================================================
// Video Block
// ============================================================================

export const videoBlockDataSchema = z.object({
  /** Video source (URL or embed code) */
  src: z.string().default(""),

  /** Video provider */
  provider: z.enum(["youtube", "vimeo", "wistia", "file", "embed"]).default("youtube"),

  /** Video title */
  title: z.string().optional(),

  /** Caption */
  caption: z.string().optional(),

  /** Poster image URL */
  poster: z.string().url().optional(),

  /** Autoplay */
  autoplay: z.boolean().default(false),

  /** Loop */
  loop: z.boolean().default(false),

  /** Muted */
  muted: z.boolean().default(false),

  /** Show controls */
  controls: z.boolean().default(true),

  /** Aspect ratio */
  aspectRatio: z.enum(["16:9", "4:3", "1:1", "9:16"]).default("16:9"),

  /** Alignment */
  align: mediaAlignSchema.default("center"),

  /** Max width */
  maxWidth: z.string().optional(),
});

export type VideoBlockData = z.infer<typeof videoBlockDataSchema>;

export const videoBlockSchema = createBlockSchema("video", videoBlockDataSchema);

export type VideoBlock = z.infer<typeof videoBlockSchema>;

export const videoBlockDefinition: BlockDefinition<VideoBlock> = {
  type: "video",
  name: "Video",
  description: "Embedded video player",
  category: "media",
  icon: "video",
  schema: videoBlockSchema,
  defaultData: {
    src: "",
    provider: "youtube",
    autoplay: false,
    loop: false,
    muted: false,
    controls: true,
    aspectRatio: "16:9",
    align: "center",
  },
  isContainer: false,
  emailCompatible: false, // Videos don't play in email
  keywords: ["video", "youtube", "vimeo", "embed"],
  version: 1,
};

// ============================================================================
// Audio Block
// ============================================================================

export const audioBlockDataSchema = z.object({
  /** Audio source URL */
  src: z.string().default(""),

  /** Audio title */
  title: z.string().optional(),

  /** Artist/author */
  artist: z.string().optional(),

  /** Album art URL */
  artwork: z.string().url().optional(),

  /** Autoplay */
  autoplay: z.boolean().default(false),

  /** Loop */
  loop: z.boolean().default(false),

  /** Show controls */
  controls: z.boolean().default(true),

  /** Player style */
  style: z.enum(["minimal", "full", "waveform"]).default("full"),
});

export type AudioBlockData = z.infer<typeof audioBlockDataSchema>;

export const audioBlockSchema = createBlockSchema("audio", audioBlockDataSchema);

export type AudioBlock = z.infer<typeof audioBlockSchema>;

export const audioBlockDefinition: BlockDefinition<AudioBlock> = {
  type: "audio",
  name: "Audio",
  description: "Audio player",
  category: "media",
  icon: "music",
  schema: audioBlockSchema,
  defaultData: {
    src: "",
    autoplay: false,
    loop: false,
    controls: true,
    style: "full",
  },
  isContainer: false,
  emailCompatible: false, // Audio doesn't play in email
  keywords: ["audio", "music", "podcast", "sound"],
  version: 1,
};

// ============================================================================
// File Block
// ============================================================================

export const fileBlockDataSchema = z.object({
  /** File URL */
  url: z.string().url().or(z.literal("")),

  /** File name */
  name: z.string().default(""),

  /** File size in bytes */
  size: z.number().int().nonnegative().optional(),

  /** MIME type */
  mimeType: z.string().optional(),

  /** Description */
  description: z.string().optional(),

  /** Download button text */
  buttonText: z.string().default("Download"),

  /** Icon style */
  iconStyle: z.enum(["auto", "document", "pdf", "archive", "code"]).default("auto"),
});

export type FileBlockData = z.infer<typeof fileBlockDataSchema>;

export const fileBlockSchema = createBlockSchema("file", fileBlockDataSchema);

export type FileBlock = z.infer<typeof fileBlockSchema>;

export const fileBlockDefinition: BlockDefinition<FileBlock> = {
  type: "file",
  name: "File",
  description: "Downloadable file attachment",
  category: "media",
  icon: "file",
  schema: fileBlockSchema,
  defaultData: {
    url: "",
    name: "",
    buttonText: "Download",
    iconStyle: "auto",
  },
  isContainer: false,
  emailCompatible: true, // File links work in email
  keywords: ["file", "download", "attachment", "document"],
  version: 1,
};

// ============================================================================
// Exports
// ============================================================================

export const mediaBlockDefinitions = [
  imageBlockDefinition,
  galleryBlockDefinition,
  videoBlockDefinition,
  audioBlockDefinition,
  fileBlockDefinition,
];
