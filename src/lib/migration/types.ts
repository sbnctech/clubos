/**
 * Migration Types
 *
 * Type definitions for the WA migration workbench.
 *
 * Charter: P3 (state machines), P6 (human-first UI)
 */

import { type BaseBlock } from "@/lib/blocks/types";
import { type ConversionWarning } from "./html-to-blocks";

// ============================================================================
// Migration Project
// ============================================================================

/**
 * A migration project represents a WA site being migrated.
 */
export interface MigrationProject {
  id: string;
  name: string;
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
  status: MigrationProjectStatus;
  crawlReportPath?: string;
  pages: MigrationPage[];
  stats: MigrationStats;
}

export type MigrationProjectStatus =
  | "crawling"      // Currently crawling the source site
  | "ready"         // Crawl complete, ready for review
  | "in_progress"   // Migration in progress
  | "completed"     // All pages migrated
  | "archived";     // Migration archived

// ============================================================================
// Migration Page
// ============================================================================

/**
 * A single page being migrated.
 */
export interface MigrationPage {
  id: string;
  sourceUrl: string;
  title: string;
  status: MigrationPageStatus;
  order: number;

  // Source data (from crawler)
  sourceData: {
    customHtmlCount: number;
    imageCount: number;
    embedCount: number;
    hasScripts: boolean;
  };

  // Converted data
  convertedBlocks?: BaseBlock[];
  warnings?: ConversionWarning[];
  widgetMappings?: Array<{
    waType: string;
    murmurantType: string;
    position: number;
  }>;

  // Review tracking
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;

  // Target page (after migration)
  targetPageId?: string;
  targetSlug?: string;
}

export type MigrationPageStatus =
  | "pending"       // Not yet converted
  | "converted"     // Auto-converted, needs review
  | "in_review"     // Currently being reviewed
  | "approved"      // Reviewed and approved
  | "published"     // Published to target site
  | "skipped";      // Intentionally skipped

// ============================================================================
// Migration Stats
// ============================================================================

export interface MigrationStats {
  totalPages: number;
  pending: number;
  converted: number;
  inReview: number;
  approved: number;
  published: number;
  skipped: number;

  totalBlocks: number;
  totalWarnings: number;
  totalWidgets: number;
}

// ============================================================================
// Workbench State
// ============================================================================

/**
 * State for the migration workbench UI.
 */
export interface WorkbenchState {
  projectId: string;
  currentPageIndex: number;
  currentPage: MigrationPage | null;
  showOriginal: boolean;
  showWarnings: boolean;
  zoom: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate migration stats from pages.
 */
export function calculateStats(pages: MigrationPage[]): MigrationStats {
  const stats: MigrationStats = {
    totalPages: pages.length,
    pending: 0,
    converted: 0,
    inReview: 0,
    approved: 0,
    published: 0,
    skipped: 0,
    totalBlocks: 0,
    totalWarnings: 0,
    totalWidgets: 0,
  };

  // Map status to stats property
  const statusToStat: Record<MigrationPageStatus, keyof MigrationStats> = {
    pending: "pending",
    converted: "converted",
    in_review: "inReview",
    approved: "approved",
    published: "published",
    skipped: "skipped",
  };

  for (const page of pages) {
    const statKey = statusToStat[page.status];
    (stats[statKey] as number)++;
    stats.totalBlocks += page.convertedBlocks?.length || 0;
    stats.totalWarnings += page.warnings?.length || 0;
    stats.totalWidgets += page.widgetMappings?.length || 0;
  }

  return stats;
}

/**
 * Get status display info.
 */
export function getStatusInfo(status: MigrationPageStatus): {
  label: string;
  color: string;
  icon: string;
} {
  const info: Record<MigrationPageStatus, { label: string; color: string; icon: string }> = {
    pending: { label: "Pending", color: "gray", icon: "clock" },
    converted: { label: "Converted", color: "blue", icon: "refresh" },
    in_review: { label: "In Review", color: "yellow", icon: "eye" },
    approved: { label: "Approved", color: "green", icon: "check" },
    published: { label: "Published", color: "purple", icon: "globe" },
    skipped: { label: "Skipped", color: "gray", icon: "skip" },
  };

  return info[status];
}

/**
 * Get next logical status for a page.
 */
export function getNextStatus(current: MigrationPageStatus): MigrationPageStatus | null {
  const flow: Record<MigrationPageStatus, MigrationPageStatus | null> = {
    pending: "converted",
    converted: "in_review",
    in_review: "approved",
    approved: "published",
    published: null,
    skipped: null,
  };

  return flow[current];
}
