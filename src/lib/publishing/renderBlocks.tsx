// Copyright (c) Santa Barbara Newcomers Club
// Block rendering for preview and published pages
//
// This module provides pure rendering functions for page blocks.
// It does NOT fetch data or perform writes - rendering only.
//
// Charter: P5 (visible state), N4 (no hidden rules)

import React from "react";
import type { Block, BlockType } from "./blocks";
import {
  validateBlockData,
  EDITABLE_BLOCK_TYPES,
  READONLY_BLOCK_TYPES,
} from "./blockSchemas";

// ============================================================================
// Types
// ============================================================================

/** Result of validating and rendering a block */
export type RenderResult =
  | { ok: true; element: React.ReactElement }
  | { ok: false; error: string; blockId: string; blockType: string };

/** Props for the BlockRenderer component */
export interface BlockRendererProps {
  blocks: Block[];
  /** Optional test ID prefix for rendered elements */
  testIdPrefix?: string;
}

// ============================================================================
// Error Component
// ============================================================================

/** Renders a visible error state when a block fails validation */
function BlockError({
  blockId,
  blockType,
  error,
  testId,
}: {
  blockId: string;
  blockType: string;
  error: string;
  testId?: string;
}): React.ReactElement {
  return (
    <div
      data-testid={testId}
      data-block-id={blockId}
      data-block-type={blockType}
      style={{
        padding: "16px",
        margin: "8px 0",
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "4px",
        color: "#991b1b",
        fontSize: "14px",
      }}
    >
      <strong>Block Error:</strong> {error}
      <div style={{ fontSize: "12px", color: "#7f1d1d", marginTop: "4px" }}>
        Type: {blockType} | ID: {blockId.slice(0, 8)}...
      </div>
    </div>
  );
}

// ============================================================================
// Simple Block Renderers
// ============================================================================

/** Hero block - full width header with optional background */
function renderHero(
  block: Block,
  testId?: string
): React.ReactElement {
  const data = block.data as {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    backgroundOverlay?: string;
    textColor?: string;
    alignment?: "left" | "center" | "right";
    ctaText?: string;
    ctaLink?: string;
    ctaStyle?: "primary" | "secondary" | "outline";
  };

  const alignment = data.alignment || "center";
  const textColor = data.textColor || "#ffffff";

  const containerStyle: React.CSSProperties = {
    padding: "64px 24px",
    textAlign: alignment,
    color: textColor,
    position: "relative",
    backgroundImage: data.backgroundImage ? `url(${data.backgroundImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: data.backgroundImage ? undefined : "#1f2937",
  };

  const overlayStyle: React.CSSProperties = data.backgroundOverlay
    ? {
        position: "absolute",
        inset: 0,
        backgroundColor: data.backgroundOverlay,
      }
    : {};

  const ctaButtonStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 24px",
    marginTop: "16px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: 500,
    backgroundColor: data.ctaStyle === "outline" ? "transparent" : "#2563eb",
    color: data.ctaStyle === "outline" ? textColor : "#ffffff",
    border: data.ctaStyle === "outline" ? `2px solid ${textColor}` : "none",
  };

  return (
    <section
      data-testid={testId}
      data-block-id={block.id}
      data-block-type="hero"
      style={containerStyle}
    >
      {data.backgroundOverlay && <div style={overlayStyle} />}
      <div style={{ position: "relative", zIndex: 1 }}>
        <h1 style={{ fontSize: "36px", fontWeight: 700, margin: "0 0 16px 0" }}>
          {data.title}
        </h1>
        {data.subtitle && (
          <p style={{ fontSize: "18px", margin: "0 0 16px 0", opacity: 0.9 }}>
            {data.subtitle}
          </p>
        )}
        {data.ctaText && data.ctaLink && (
          <a href={data.ctaLink} style={ctaButtonStyle}>
            {data.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

/** Text block - rich text content */
function renderText(
  block: Block,
  testId?: string
): React.ReactElement {
  const data = block.data as {
    content: string;
    alignment?: "left" | "center" | "right";
  };

  return (
    <div
      data-testid={testId}
      data-block-id={block.id}
      data-block-type="text"
      style={{
        padding: "16px 0",
        textAlign: data.alignment || "left",
      }}
      dangerouslySetInnerHTML={{ __html: data.content }}
    />
  );
}

/** Image block - single image with optional caption */
function renderImage(
  block: Block,
  testId?: string
): React.ReactElement {
  const data = block.data as {
    src: string;
    alt: string;
    caption?: string;
    width?: string;
    alignment?: "left" | "center" | "right";
    linkUrl?: string;
  };

  const alignment = data.alignment || "center";
  const containerStyle: React.CSSProperties = {
    padding: "16px 0",
    textAlign: alignment,
  };

  const imageStyle: React.CSSProperties = {
    maxWidth: data.width || "100%",
    height: "auto",
    borderRadius: "4px",
  };

  const image = (
    <img src={data.src} alt={data.alt} style={imageStyle} />
  );

  return (
    <figure
      data-testid={testId}
      data-block-id={block.id}
      data-block-type="image"
      style={containerStyle}
    >
      {data.linkUrl ? (
        <a href={data.linkUrl}>{image}</a>
      ) : (
        image
      )}
      {data.caption && (
        <figcaption
          style={{
            marginTop: "8px",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
}

/** CTA block - call to action button */
function renderCta(
  block: Block,
  testId?: string
): React.ReactElement {
  const data = block.data as {
    text: string;
    link: string;
    style?: "primary" | "secondary" | "outline";
    size?: "small" | "medium" | "large";
    alignment?: "left" | "center" | "right";
  };

  const alignment = data.alignment || "center";
  const size = data.size || "medium";
  const style = data.style || "primary";

  const paddingMap = {
    small: "8px 16px",
    medium: "12px 24px",
    large: "16px 32px",
  };

  const fontSizeMap = {
    small: "14px",
    medium: "16px",
    large: "18px",
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-block",
    padding: paddingMap[size],
    fontSize: fontSizeMap[size],
    fontWeight: 500,
    borderRadius: "6px",
    textDecoration: "none",
    backgroundColor: style === "primary" ? "#2563eb" : style === "secondary" ? "#6b7280" : "transparent",
    color: style === "outline" ? "#2563eb" : "#ffffff",
    border: style === "outline" ? "2px solid #2563eb" : "none",
  };

  return (
    <div
      data-testid={testId}
      data-block-id={block.id}
      data-block-type="cta"
      style={{ padding: "16px 0", textAlign: alignment }}
    >
      <a href={data.link} style={buttonStyle}>
        {data.text}
      </a>
    </div>
  );
}

/** Divider block - horizontal line */
function renderDivider(
  block: Block,
  testId?: string
): React.ReactElement {
  const data = block.data as {
    style?: "solid" | "dashed" | "dotted";
    width?: "full" | "half" | "quarter";
  };

  const widthMap = {
    full: "100%",
    half: "50%",
    quarter: "25%",
  };

  return (
    <hr
      data-testid={testId}
      data-block-id={block.id}
      data-block-type="divider"
      style={{
        width: widthMap[data.width || "full"],
        margin: "24px auto",
        border: "none",
        borderTop: `1px ${data.style || "solid"} #e5e7eb`,
      }}
    />
  );
}

/** Spacer block - vertical space */
function renderSpacer(
  block: Block,
  testId?: string
): React.ReactElement {
  const data = block.data as {
    height?: "small" | "medium" | "large";
  };

  const heightMap = {
    small: "16px",
    medium: "32px",
    large: "64px",
  };

  return (
    <div
      data-testid={testId}
      data-block-id={block.id}
      data-block-type="spacer"
      style={{ height: heightMap[data.height || "medium"] }}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// Complex Block Placeholder
// ============================================================================

/** Renders a stable placeholder for complex blocks that need runtime data */
function renderComplexPlaceholder(
  block: Block,
  testId?: string
): React.ReactElement {
  const data = block.data as Record<string, unknown>;

  // Create a stable summary of the block configuration
  const summary: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      summary[key] = `[${value.length} items]`;
    } else if (typeof value === "object" && value !== null) {
      summary[key] = "{...}";
    } else {
      summary[key] = value;
    }
  }

  const typeLabels: Record<string, string> = {
    cards: "Cards",
    "event-list": "Event List",
    gallery: "Gallery",
    faq: "FAQ",
    contact: "Contact Form",
  };

  return (
    <div
      data-testid={testId}
      data-block-id={block.id}
      data-block-type={block.type}
      style={{
        padding: "24px",
        margin: "8px 0",
        backgroundColor: "#f9fafb",
        border: "1px dashed #d1d5db",
        borderRadius: "4px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          fontWeight: 600,
          color: "#374151",
          marginBottom: "8px",
        }}
      >
        {typeLabels[block.type] || block.type}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          textAlign: "left",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        {JSON.stringify(summary, null, 2)}
      </div>
    </div>
  );
}

// ============================================================================
// Main Rendering Functions
// ============================================================================

/**
 * Render a single block with validation.
 * Fails closed: invalid blocks render as error components.
 *
 * @param block - The block to render
 * @param testId - Optional test ID for the rendered element
 * @returns RenderResult with either the element or error details
 */
export function renderBlock(
  block: Block,
  testId?: string
): RenderResult {
  // Validate block data against schema
  const validation = validateBlockData(block.type, block.data);
  if (!validation.ok) {
    return {
      ok: false,
      error: validation.error,
      blockId: block.id,
      blockType: block.type,
    };
  }

  // Render based on block type
  try {
    let element: React.ReactElement;

    if (EDITABLE_BLOCK_TYPES.includes(block.type)) {
      // Simple blocks with full rendering
      switch (block.type) {
        case "hero":
          element = renderHero(block, testId);
          break;
        case "text":
          element = renderText(block, testId);
          break;
        case "image":
          element = renderImage(block, testId);
          break;
        case "cta":
          element = renderCta(block, testId);
          break;
        case "divider":
          element = renderDivider(block, testId);
          break;
        case "spacer":
          element = renderSpacer(block, testId);
          break;
        default:
          // Should not reach here, but fail safely
          element = renderComplexPlaceholder(block, testId);
      }
    } else if (READONLY_BLOCK_TYPES.includes(block.type)) {
      // Complex blocks render as placeholders
      element = renderComplexPlaceholder(block, testId);
    } else {
      // Unknown block type
      return {
        ok: false,
        error: `Unknown block type: ${block.type}`,
        blockId: block.id,
        blockType: block.type,
      };
    }

    return { ok: true, element };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Render failed",
      blockId: block.id,
      blockType: block.type,
    };
  }
}

/**
 * Render multiple blocks in order.
 * Each block is validated and rendered independently.
 * Failed blocks render as error components.
 *
 * @param blocks - Array of blocks to render
 * @param testIdPrefix - Optional prefix for test IDs
 * @returns Array of React elements
 */
export function renderBlocks(
  blocks: Block[],
  testIdPrefix?: string
): React.ReactElement[] {
  // Sort by order
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return sorted.map((block, index) => {
    const testId = testIdPrefix ? `${testIdPrefix}-block-${index}` : undefined;
    const result = renderBlock(block, testId);

    if (result.ok) {
      return <React.Fragment key={block.id}>{result.element}</React.Fragment>;
    } else {
      return (
        <BlockError
          key={block.id}
          blockId={result.blockId}
          blockType={result.blockType}
          error={result.error}
          testId={testId}
        />
      );
    }
  });
}

/**
 * BlockRenderer component - renders a list of blocks.
 * Use this in page components for a declarative API.
 */
export function BlockRenderer({
  blocks,
  testIdPrefix,
}: BlockRendererProps): React.ReactElement {
  const elements = renderBlocks(blocks, testIdPrefix);
  return <>{elements}</>;
}

// ============================================================================
// Exports
// ============================================================================

export {
  BlockError,
  renderHero,
  renderText,
  renderImage,
  renderCta,
  renderDivider,
  renderSpacer,
  renderComplexPlaceholder,
};
