/**
 * Migration Project Management
 *
 * Functions for creating and managing migration projects.
 *
 * Charter: P4 (no hidden rules), P6 (human-first UI)
 */

import { type MigrationProject, type MigrationPage, type MigrationStats, calculateStats } from "./types";
import { convertCustomHtmlBlocks } from "./html-to-blocks";
import { type CrawlReport, type PageContent } from "../../../scripts/migration/lib/wa-crawler";

// ============================================================================
// Project Creation
// ============================================================================

/**
 * Create a migration project from a crawl report.
 */
export function createProjectFromCrawlReport(
  report: CrawlReport,
  projectName?: string
): MigrationProject {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Convert pages
  const pages: MigrationPage[] = report.pages.map((page, index) =>
    createMigrationPage(page, index)
  );

  // Calculate stats
  const stats = calculateStats(pages);

  return {
    id,
    name: projectName || extractSiteName(report.config.baseUrl),
    sourceUrl: report.config.baseUrl,
    createdAt: now,
    updatedAt: now,
    status: "ready",
    pages,
    stats,
  };
}

/**
 * Create a migration page from crawl data.
 */
function createMigrationPage(page: PageContent, order: number): MigrationPage {
  const id = crypto.randomUUID();

  // Auto-convert the content
  const conversionResult = convertCustomHtmlBlocks(page.customHtml);

  return {
    id,
    sourceUrl: page.url,
    title: cleanTitle(page.title),
    status: "converted",
    order,
    sourceData: {
      customHtmlCount: page.customHtml.length,
      imageCount: page.images.length,
      embedCount: page.embeds.length,
      hasScripts: page.customHtml.some((h) => h.containsScript),
    },
    convertedBlocks: conversionResult.blocks,
    warnings: conversionResult.warnings,
    widgetMappings: conversionResult.widgetMapping,
  };
}

/**
 * Extract site name from URL.
 */
function extractSiteName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    // Remove common prefixes/suffixes
    return hostname
      .replace(/^www\./, "")
      .replace(/\.wildapricot\.(org|com)$/, "")
      .replace(/\.(org|com|net)$/, "")
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  } catch {
    return "Migration Project";
  }
}

/**
 * Clean page title (remove site prefix).
 */
function cleanTitle(title: string): string {
  // WA titles are often "Site Name - Page Title"
  const parts = title.split(" - ");
  if (parts.length > 1) {
    return parts.slice(1).join(" - ");
  }
  return title;
}

// ============================================================================
// Project Updates
// ============================================================================

/**
 * Update a page's status.
 */
export function updatePageStatus(
  project: MigrationProject,
  pageId: string,
  status: MigrationPage["status"],
  reviewedBy?: string,
  notes?: string
): MigrationProject {
  const now = new Date().toISOString();

  const pages = project.pages.map((page) => {
    if (page.id !== pageId) return page;

    return {
      ...page,
      status,
      reviewedAt: now,
      reviewedBy,
      notes: notes || page.notes,
    };
  });

  return {
    ...project,
    pages,
    updatedAt: now,
    stats: calculateStats(pages),
  };
}

/**
 * Update a page's blocks (after manual editing).
 */
export function updatePageBlocks(
  project: MigrationProject,
  pageId: string,
  blocks: MigrationPage["convertedBlocks"]
): MigrationProject {
  const now = new Date().toISOString();

  const pages = project.pages.map((page) => {
    if (page.id !== pageId) return page;

    return {
      ...page,
      convertedBlocks: blocks,
      status: page.status === "converted" ? "in_review" : page.status,
    };
  });

  return {
    ...project,
    pages,
    updatedAt: now,
    stats: calculateStats(pages),
  };
}

/**
 * Get navigation info for workbench.
 */
export function getNavigationInfo(project: MigrationProject, currentPageId: string): {
  currentIndex: number;
  totalPages: number;
  previousPage: MigrationPage | null;
  nextPage: MigrationPage | null;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
} {
  const currentIndex = project.pages.findIndex((p) => p.id === currentPageId);
  const completedStatuses = ["approved", "published", "skipped"];
  const completed = project.pages.filter((p) => completedStatuses.includes(p.status)).length;

  return {
    currentIndex,
    totalPages: project.pages.length,
    previousPage: currentIndex > 0 ? project.pages[currentIndex - 1] : null,
    nextPage: currentIndex < project.pages.length - 1 ? project.pages[currentIndex + 1] : null,
    progress: {
      completed,
      total: project.pages.length,
      percentage: Math.round((completed / project.pages.length) * 100),
    },
  };
}

// ============================================================================
// Serialization
// ============================================================================

/**
 * Serialize project to JSON for storage.
 */
export function serializeProject(project: MigrationProject): string {
  return JSON.stringify(project, null, 2);
}

/**
 * Deserialize project from JSON.
 */
export function deserializeProject(json: string): MigrationProject {
  return JSON.parse(json) as MigrationProject;
}
