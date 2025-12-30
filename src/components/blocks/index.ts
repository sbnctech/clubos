/**
 * Block Components
 *
 * Exports for the block-based content rendering system.
 *
 * @see src/lib/blocks/types.ts
 */

export { BlockComponent, type BlockComponentProps } from "./BlockComponent";
export { SectionRenderer, type Section, type SectionRendererProps } from "./SectionRenderer";
export {
  PageRenderer,
  EmailPageRenderer,
  type PageContent,
  type LegacyPageContent,
  type PageRendererProps,
} from "./PageRenderer";
