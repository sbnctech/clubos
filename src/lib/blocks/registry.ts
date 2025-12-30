/**
 * Block Registry
 *
 * Central registry for all block types. Provides type-safe access to block
 * definitions, schemas, and utilities.
 *
 * Charter: P4 (no hidden rules), P6 (human-first UI), P8 (stable contracts)
 *
 * @see docs/projects/PAGE_PRESENTATION_SYSTEM.md
 */

import type { BlockDefinition, BlockType, BaseBlock, BlockCategory } from "./types";
import { textBlockDefinitions } from "./schemas/text";
import { mediaBlockDefinitions } from "./schemas/media";
import { layoutBlockDefinitions } from "./schemas/layout";
import { interactiveBlockDefinitions } from "./schemas/interactive";
import { embedBlockDefinitions } from "./schemas/embed";
import { navigationBlockDefinitions } from "./schemas/navigation";
import { dataBlockDefinitions } from "./schemas/data";

// ============================================================================
// Registry
// ============================================================================

/**
 * All block definitions combined.
 */
export const allBlockDefinitions: BlockDefinition[] = [
  ...textBlockDefinitions,
  ...mediaBlockDefinitions,
  ...layoutBlockDefinitions,
  ...interactiveBlockDefinitions,
  ...embedBlockDefinitions,
  ...navigationBlockDefinitions,
  ...dataBlockDefinitions,
];

/**
 * Block definitions indexed by type.
 */
export const blockRegistry: Record<BlockType, BlockDefinition> = Object.fromEntries(
  allBlockDefinitions.map((def) => [def.type, def])
) as Record<BlockType, BlockDefinition>;

// ============================================================================
// Registry Functions
// ============================================================================

/**
 * Get a block definition by type.
 */
export function getBlockDefinition(type: BlockType): BlockDefinition | undefined {
  return blockRegistry[type];
}

/**
 * Get a block definition by type, throwing if not found.
 */
export function requireBlockDefinition(type: BlockType): BlockDefinition {
  const def = blockRegistry[type];
  if (!def) {
    throw new Error(`Unknown block type: ${type}`);
  }
  return def;
}

/**
 * Get all block definitions for a category.
 */
export function getBlockDefinitionsByCategory(category: BlockCategory): BlockDefinition[] {
  return allBlockDefinitions.filter((def) => def.category === category);
}

/**
 * Get all email-compatible block definitions.
 */
export function getEmailCompatibleBlockDefinitions(): BlockDefinition[] {
  return allBlockDefinitions.filter((def) => def.emailCompatible);
}

/**
 * Get all container block definitions.
 */
export function getContainerBlockDefinitions(): BlockDefinition[] {
  return allBlockDefinitions.filter((def) => def.isContainer);
}

/**
 * Check if a block type is email-compatible.
 */
export function isEmailCompatible(type: BlockType): boolean {
  const def = blockRegistry[type];
  return def?.emailCompatible ?? false;
}

/**
 * Check if a block type is a container.
 */
export function isContainerBlock(type: BlockType): boolean {
  const def = blockRegistry[type];
  return def?.isContainer ?? false;
}

/**
 * Search block definitions by keyword.
 */
export function searchBlockDefinitions(query: string): BlockDefinition[] {
  const lowerQuery = query.toLowerCase();
  return allBlockDefinitions.filter(
    (def) =>
      def.name.toLowerCase().includes(lowerQuery) ||
      def.description.toLowerCase().includes(lowerQuery) ||
      def.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
  );
}

// ============================================================================
// Block Creation
// ============================================================================

/**
 * Create a new block with default data.
 */
export function createDefaultBlock(type: BlockType, id?: string): BaseBlock {
  const def = requireBlockDefinition(type);
  return {
    id: id ?? crypto.randomUUID(),
    type,
    version: def.version,
    data: { ...def.defaultData },
    meta: {},
  };
}

/**
 * Create a new block with custom data.
 */
export function createBlock<T extends BlockType>(
  type: T,
  data: Partial<Record<string, unknown>>,
  id?: string
): BaseBlock {
  const def = requireBlockDefinition(type);
  return {
    id: id ?? crypto.randomUUID(),
    type,
    version: def.version,
    data: { ...def.defaultData, ...data },
    meta: {},
  };
}

// ============================================================================
// Block Validation
// ============================================================================

/**
 * Validate a block against its schema.
 */
export function validateBlock(block: unknown): { success: true; data: BaseBlock } | { success: false; errors: string[] } {
  if (!block || typeof block !== "object") {
    return { success: false, errors: ["Block must be an object"] };
  }

  const typedBlock = block as Record<string, unknown>;
  const type = typedBlock.type as BlockType;

  if (!type) {
    return { success: false, errors: ["Block must have a type"] };
  }

  const def = blockRegistry[type];
  if (!def) {
    return { success: false, errors: [`Unknown block type: ${type}`] };
  }

  const result = def.schema.safeParse(block);
  if (result.success) {
    return { success: true, data: result.data as BaseBlock };
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
  };
}

/**
 * Validate multiple blocks.
 */
export function validateBlocks(
  blocks: unknown[]
): { success: true; data: BaseBlock[] } | { success: false; errors: string[] } {
  const validatedBlocks: BaseBlock[] = [];
  const errors: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const result = validateBlock(blocks[i]);
    if (result.success) {
      validatedBlocks.push(result.data);
    } else {
      errors.push(...result.errors.map((e) => `Block ${i}: ${e}`));
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedBlocks };
}

// ============================================================================
// Block Filtering for Context
// ============================================================================

/**
 * Filter blocks for email context (remove incompatible blocks).
 */
export function filterBlocksForEmail(blocks: BaseBlock[]): BaseBlock[] {
  return blocks.filter((block) => isEmailCompatible(block.type));
}

/**
 * Get allowed child block types for a container.
 */
export function getAllowedChildTypes(parentType: BlockType): BlockType[] | undefined {
  const def = blockRegistry[parentType];
  if (!def?.isContainer) {
    return undefined;
  }
  // If allowedChildren is undefined, all types are allowed
  return def.allowedChildren;
}

/**
 * Check if a child block type is allowed in a parent container.
 */
export function isChildTypeAllowed(parentType: BlockType, childType: BlockType): boolean {
  const allowed = getAllowedChildTypes(parentType);
  if (allowed === undefined) {
    // All types allowed
    return true;
  }
  return allowed.includes(childType);
}

// ============================================================================
// Exports
// ============================================================================

export {
  // Re-export schema collections for convenience
  textBlockDefinitions,
  mediaBlockDefinitions,
  layoutBlockDefinitions,
  interactiveBlockDefinitions,
  embedBlockDefinitions,
  navigationBlockDefinitions,
  dataBlockDefinitions,
};
