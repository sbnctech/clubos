/**
 * Block Schema Helpers
 *
 * Shared utilities for creating block schemas.
 *
 * Charter: P8 (stable contracts)
 */

import { z } from "zod";
import { blockIdSchema, type BaseBlock, type BlockType } from "../types";

/**
 * Meta schema shared by all blocks.
 * Uses passthrough() to allow additional properties and be compatible with BaseBlock.
 */
export const blockMetaSchema = z
  .object({
    className: z.string().optional(),
    style: z.record(z.string(), z.string()).optional(),
    anchor: z.string().optional(),
    visibility: z
      .object({
        hideOnMobile: z.boolean().default(false),
        hideOnDesktop: z.boolean().default(false),
        hideInEmail: z.boolean().default(false),
      })
      .optional(),
    animation: z
      .object({
        type: z.string().optional(),
        delay: z.number().optional(),
        duration: z.number().optional(),
      })
      .optional(),
  })
  .default({});

/**
 * Creates a typed block schema for a specific block type.
 * Uses z.any() for children to avoid circular reference issues.
 */
export function createBlockSchema<T extends z.ZodRawShape>(
  type: BlockType,
  dataSchema: z.ZodObject<T>
) {
  return z.object({
    id: blockIdSchema,
    type: z.literal(type),
    version: z.number().int().positive().default(1),
    data: dataSchema,
    meta: blockMetaSchema,
    children: z.array(z.lazy((): z.ZodType<BaseBlock> => z.any())).optional(),
  });
}

/**
 * Creates a typed block schema that accepts any ZodType for data (for complex nested schemas).
 */
export function createBlockSchemaWithComplexData<T>(
  type: BlockType,
  dataSchema: z.ZodType<T>
) {
  return z.object({
    id: blockIdSchema,
    type: z.literal(type),
    version: z.number().int().positive().default(1),
    data: dataSchema,
    meta: blockMetaSchema,
    children: z.array(z.lazy((): z.ZodType<BaseBlock> => z.any())).optional(),
  });
}
