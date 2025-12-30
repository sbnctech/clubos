/**
 * Block Component
 *
 * Renders individual blocks based on their type using the block registry.
 * Supports both new Zod-validated blocks and legacy blocks.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 *
 * @see src/lib/blocks/types.ts
 */

import { type BaseBlock, type BlockRenderContext, type BlockType } from "@/lib/blocks";

// ============================================================================
// Block Component Props
// ============================================================================

export interface BlockComponentProps {
  /** The block to render */
  block: BaseBlock;

  /** Render context */
  context: BlockRenderContext;

  /** Custom className */
  className?: string;

  /** Click handler (for edit mode) */
  onClick?: () => void;

  /** Whether block is selected (edit mode) */
  isSelected?: boolean;
}

// ============================================================================
// Individual Block Components
// ============================================================================

function TextBlockComponent({ block }: { block: BaseBlock }) {
  const data = block.data as { content?: string; alignment?: string };
  return (
    <div
      data-block-type="text"
      data-block-id={block.id}
      style={{ textAlign: (data.alignment as "left" | "center" | "right") || "left" }}
    >
      <div dangerouslySetInnerHTML={{ __html: data.content || "" }} />
    </div>
  );
}

function HeadingBlockComponent({ block }: { block: BaseBlock }) {
  const data = block.data as { text?: string; level?: number; alignment?: string };
  const level = data.level || 2;
  const style = { textAlign: (data.alignment as "left" | "center" | "right") || "left" } as const;
  const props = { "data-block-type": "heading", "data-block-id": block.id, style };

  switch (level) {
    case 1:
      return <h1 {...props}>{data.text || ""}</h1>;
    case 2:
      return <h2 {...props}>{data.text || ""}</h2>;
    case 3:
      return <h3 {...props}>{data.text || ""}</h3>;
    case 4:
      return <h4 {...props}>{data.text || ""}</h4>;
    case 5:
      return <h5 {...props}>{data.text || ""}</h5>;
    case 6:
      return <h6 {...props}>{data.text || ""}</h6>;
    default:
      return <h2 {...props}>{data.text || ""}</h2>;
  }
}

function ParagraphBlockComponent({ block }: { block: BaseBlock }) {
  const data = block.data as { content?: string; alignment?: string };
  return (
    <p
      data-block-type="paragraph"
      data-block-id={block.id}
      style={{ textAlign: (data.alignment as "left" | "center" | "right") || "left" }}
    >
      {data.content || ""}
    </p>
  );
}

function ImageBlockComponent({ block }: { block: BaseBlock }) {
  const data = block.data as {
    src?: string;
    alt?: string;
    caption?: string;
    width?: string;
    alignment?: string;
    linkUrl?: string;
  };

  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- user-provided dynamic src
    <img
      src={data.src || ""}
      alt={data.alt || ""}
      style={{
        maxWidth: data.width || "100%",
        height: "auto",
        borderRadius: "var(--border-radius-md, 4px)",
      }}
    />
  );

  return (
    <figure
      data-block-type="image"
      data-block-id={block.id}
      style={{ textAlign: (data.alignment as "left" | "center" | "right") || "center" }}
    >
      {data.linkUrl ? <a href={data.linkUrl}>{img}</a> : img}
      {data.caption && (
        <figcaption style={{ marginTop: "var(--spacing-sm, 8px)", fontSize: "var(--font-size-sm, 14px)", color: "#666" }}>
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
}

function ButtonBlockComponent({ block }: { block: BaseBlock }) {
  const data = block.data as {
    text?: string;
    url?: string;
    variant?: string;
    size?: string;
    alignment?: string;
  };

  const sizes = {
    sm: "var(--spacing-xs, 4px) var(--spacing-md, 16px)",
    md: "var(--spacing-sm, 8px) var(--spacing-lg, 24px)",
    lg: "var(--spacing-md, 16px) var(--spacing-xl, 32px)",
  };

  return (
    <div
      data-block-type="button"
      data-block-id={block.id}
      style={{ textAlign: (data.alignment as "left" | "center" | "right") || "center" }}
    >
      <a
        href={data.url || "#"}
        style={{
          display: "inline-block",
          padding: sizes[(data.size as keyof typeof sizes) || "md"],
          backgroundColor: data.variant === "outline" ? "transparent" : "var(--color-primary, #0066cc)",
          color: data.variant === "outline" ? "var(--color-primary, #0066cc)" : "#fff",
          textDecoration: "none",
          borderRadius: "var(--border-radius-md, 4px)",
          fontWeight: 600,
          border: data.variant === "outline" ? "2px solid var(--color-primary, #0066cc)" : "none",
        }}
      >
        {data.text || "Click here"}
      </a>
    </div>
  );
}

function DividerBlockComponent({ block }: { block: BaseBlock }) {
  const data = block.data as { style?: string; width?: string };
  const widths = { full: "100%", "75": "75%", half: "50%", quarter: "25%" };
  return (
    <hr
      data-block-type="divider"
      data-block-id={block.id}
      style={{
        margin: "var(--spacing-lg, 24px) auto",
        width: widths[(data.width as keyof typeof widths) || "full"],
        border: "none",
        borderTop: `1px ${data.style || "solid"} #ddd`,
      }}
    />
  );
}

function SpacerBlockComponent({ block }: { block: BaseBlock }) {
  const data = block.data as { height?: string };
  const heights = { xs: "8px", sm: "16px", md: "32px", lg: "48px", xl: "64px" };
  return (
    <div
      data-block-type="spacer"
      data-block-id={block.id}
      style={{ height: heights[(data.height as keyof typeof heights) || "md"] }}
    />
  );
}

function HtmlBlockComponent({ block }: { block: BaseBlock }) {
  const data = block.data as { html?: string };
  return (
    <div
      data-block-type="html"
      data-block-id={block.id}
      dangerouslySetInnerHTML={{ __html: data.html || "" }}
    />
  );
}

function QuoteBlockComponent({ block }: { block: BaseBlock }) {
  const data = block.data as { text?: string; citation?: string; variant?: string };
  return (
    <blockquote
      data-block-type="quote"
      data-block-id={block.id}
      style={{
        borderLeft: data.variant === "centered" ? "none" : "4px solid var(--color-primary, #0066cc)",
        paddingLeft: data.variant === "centered" ? "0" : "var(--spacing-md, 16px)",
        margin: "var(--spacing-lg, 24px) 0",
        fontStyle: "italic",
        textAlign: data.variant === "centered" ? "center" : "left",
      }}
    >
      <p style={{ margin: 0 }}>{data.text || ""}</p>
      {data.citation && (
        <cite style={{ display: "block", marginTop: "var(--spacing-sm, 8px)", fontStyle: "normal", color: "#666" }}>
          — {data.citation}
        </cite>
      )}
    </blockquote>
  );
}

function ListBlockComponent({ block }: { block: BaseBlock }) {
  const data = block.data as { items?: Array<{ text: string }>; style?: string };
  const Tag = data.style === "ordered" ? "ol" : "ul";
  return (
    <Tag data-block-type="list" data-block-id={block.id}>
      {(data.items || []).map((item, idx) => (
        <li key={idx}>{item.text}</li>
      ))}
    </Tag>
  );
}

function CodeBlockComponent({ block }: { block: BaseBlock }) {
  const data = block.data as { code?: string; language?: string };
  return (
    <pre
      data-block-type="code"
      data-block-id={block.id}
      style={{
        backgroundColor: "#f4f4f4",
        padding: "var(--spacing-md, 16px)",
        borderRadius: "var(--border-radius-md, 4px)",
        overflow: "auto",
      }}
    >
      <code>{data.code || ""}</code>
    </pre>
  );
}

function TableBlockComponent({ block }: { block: BaseBlock }) {
  const data = block.data as {
    columns?: Array<{ id: string; header: string }>;
    rows?: Array<{ cells: Record<string, { content: string }> }>;
  };
  return (
    <table
      data-block-type="table"
      data-block-id={block.id}
      style={{ width: "100%", borderCollapse: "collapse" }}
    >
      <thead>
        <tr>
          {(data.columns || []).map((col) => (
            <th
              key={col.id}
              style={{
                padding: "var(--spacing-sm, 8px)",
                borderBottom: "2px solid #ddd",
                textAlign: "left",
              }}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(data.rows || []).map((row, rowIdx) => (
          <tr key={rowIdx}>
            {(data.columns || []).map((col) => (
              <td
                key={col.id}
                style={{
                  padding: "var(--spacing-sm, 8px)",
                  borderBottom: "1px solid #eee",
                }}
              >
                {row.cells[col.id]?.content || ""}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PlaceholderBlockComponent({ block }: { block: BaseBlock }) {
  const data = block.data as { message?: string };
  return (
    <div
      data-block-type="placeholder"
      data-block-id={block.id}
      style={{
        padding: "var(--spacing-lg, 24px)",
        backgroundColor: "#f9f9f9",
        border: "2px dashed #ddd",
        borderRadius: "var(--border-radius-md, 4px)",
        textAlign: "center",
        color: "#666",
      }}
    >
      {data.message || "Placeholder block"}
    </div>
  );
}

// ============================================================================
// Block Renderer Map
// ============================================================================

const BLOCK_RENDERERS: Partial<Record<BlockType, React.ComponentType<{ block: BaseBlock }>>> = {
  text: TextBlockComponent,
  heading: HeadingBlockComponent,
  paragraph: ParagraphBlockComponent,
  image: ImageBlockComponent,
  button: ButtonBlockComponent,
  divider: DividerBlockComponent,
  spacer: SpacerBlockComponent,
  html: HtmlBlockComponent,
  quote: QuoteBlockComponent,
  list: ListBlockComponent,
  code: CodeBlockComponent,
  table: TableBlockComponent,
  placeholder: PlaceholderBlockComponent,
};

// ============================================================================
// Main Block Component
// ============================================================================

/**
 * Renders a single block based on its type.
 */
export function BlockComponent({
  block,
  context,
  className,
  onClick,
  isSelected,
}: BlockComponentProps) {
  // Check visibility settings
  const visibility = block.meta?.visibility;
  if (visibility) {
    if (visibility.hideInEmail && context.pageContext === "email") {
      return null;
    }
    // Note: hideOnMobile/hideOnDesktop would need CSS media queries
  }

  const Renderer = BLOCK_RENDERERS[block.type];

  if (!Renderer) {
    // Fallback for unknown block types
    return (
      <div
        data-block-type={block.type}
        data-block-id={block.id}
        className={className}
        onClick={onClick}
        style={{
          padding: "var(--spacing-md, 16px)",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "var(--border-radius-md, 4px)",
        }}
      >
        Unknown block type: {block.type}
      </div>
    );
  }

  const wrapperStyle: React.CSSProperties = {
    ...(block.meta?.style as React.CSSProperties),
    outline: isSelected ? "2px solid var(--color-primary, #0066cc)" : undefined,
  };

  return (
    <div
      className={[block.meta?.className, className].filter(Boolean).join(" ") || undefined}
      style={wrapperStyle}
      onClick={onClick}
      id={block.meta?.anchor}
      data-block-id={block.id}
    >
      <Renderer block={block} />
    </div>
  );
}

export default BlockComponent;
