"use client";

/**
 * Migration Workbench - Side-by-Side Preview
 *
 * Shows original WA site next to migrated Murmurant preview,
 * allowing visual comparison and issue resolution.
 *
 * Charter: P6 (human-first UI)
 */

import React, { useState, useEffect, useCallback, useMemo, type CSSProperties } from "react";
import {
  type MigrationProject,
  type MigrationPage,
  getStatusInfo,
} from "@/lib/migration/types";
import { getNavigationInfo, updatePageStatus } from "@/lib/migration/project";
import { type BaseBlock } from "@/lib/blocks/types";
import { analyzeScript, type ScriptAnalysis } from "@/lib/migration/script-analyzer";
import { analyzeHtmlPatterns, type HtmlPatternMatch } from "@/lib/migration/html-pattern-analyzer";
import {
  extractThemeFromCrawl,
  getThemeSummary,
  type ExtractedTheme,
} from "@/lib/migration/theme-extractor";

// ============================================================================
// Types
// ============================================================================

interface MigrationIssue {
  id: string;
  type: "script" | "html-pattern" | "legacy-html" | "widget";
  blockIndex: number;
  severity: "auto-fix" | "review" | "manual";
  title: string;
  description: string;
  recommendation: string;
  action: {
    label: string;
    type: "accept" | "replace" | "remove" | "skip";
  };
  originalContent: string;
  suggestedReplacement?: {
    blockType: string;
    blockData: Record<string, unknown>;
  };
}

type ViewMode = "split" | "source" | "preview" | "issues";

// ============================================================================
// Demo Data
// ============================================================================

const DEMO_PROJECT: MigrationProject = {
  id: "demo-1",
  name: "Migration Project",
  sourceUrl: "https://example.wildapricot.org",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "in_progress",
  pages: [],
  stats: {
    totalPages: 0, pending: 0, converted: 0, inReview: 0,
    approved: 0, published: 0, skipped: 0,
    totalBlocks: 0, totalWarnings: 0, totalWidgets: 0,
  },
};

// ============================================================================
// Main Component
// ============================================================================

export function WorkbenchClient() {
  const [project, setProject] = useState<MigrationProject | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedIssues, setResolvedIssues] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [extractedTheme, setExtractedTheme] = useState<ExtractedTheme | null>(null);
  const [themeConfirmed, setThemeConfirmed] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);

  // Load project
  useEffect(() => {
    async function loadProject() {
      try {
        const saved = localStorage.getItem("migration-workbench-project");
        if (saved) {
          const parsed = JSON.parse(saved);
          setProject(parsed);
          // Extract theme from saved project
          if (parsed.pages?.length > 0) {
            const theme = extractThemeFromCrawl({ pages: parsed.pages });
            setExtractedTheme(theme);
          }
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/admin/migration/demo-project");
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        } else {
          setProject(DEMO_PROJECT);
        }
      } catch (err) {
        console.error("Failed to load project:", err);
        setProject(DEMO_PROJECT);
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, []);

  // Save project
  useEffect(() => {
    if (project) {
      localStorage.setItem("migration-workbench-project", JSON.stringify(project));
    }
  }, [project]);

  const currentPage = project?.pages[currentPageIndex] || null;

  // Extract issues from current page
  const issues = useMemo(() => extractIssues(currentPage), [currentPage]);
  const unresolvedIssues = issues.filter(i => !resolvedIssues.has(i.id));
  const autoFixable = unresolvedIssues.filter(i => i.severity === "auto-fix");
  const needsReview = unresolvedIssues.filter(i => i.severity !== "auto-fix");

  // Navigation
  const goToPage = useCallback((index: number) => {
    if (project && index >= 0 && index < project.pages.length) {
      setCurrentPageIndex(index);
      setResolvedIssues(new Set());
    }
  }, [project]);

  // Issue resolution
  const resolveIssue = useCallback((issueId: string, action: "accept" | "skip" | "remove") => {
    setResolvedIssues(prev => new Set([...prev, issueId]));

    const issue = issues.find(i => i.id === issueId);
    if (action === "accept" && issue?.suggestedReplacement && project && currentPage) {
      const updatedBlocks = [...(currentPage.convertedBlocks || [])];
      updatedBlocks[issue.blockIndex] = {
        id: crypto.randomUUID(),
        type: issue.suggestedReplacement.blockType as BaseBlock["type"],
        version: 1,
        data: issue.suggestedReplacement.blockData,
        meta: {},
      };

      const updatedPages = project.pages.map((page, i) =>
        i === currentPageIndex ? { ...page, convertedBlocks: updatedBlocks } : page
      );
      setProject({ ...project, pages: updatedPages });
    }

    if (action === "remove" && issue && project && currentPage) {
      const updatedBlocks = (currentPage.convertedBlocks || []).filter((_, i) => i !== issue.blockIndex);
      const updatedPages = project.pages.map((page, i) =>
        i === currentPageIndex ? { ...page, convertedBlocks: updatedBlocks } : page
      );
      setProject({ ...project, pages: updatedPages });
    }
  }, [issues, project, currentPage, currentPageIndex]);

  // Auto-fix all
  const autoFixAll = useCallback(() => {
    for (const issue of autoFixable) {
      if (issue.action.type === "remove") {
        resolveIssue(issue.id, "remove");
      } else if (issue.suggestedReplacement) {
        resolveIssue(issue.id, "accept");
      }
    }
  }, [autoFixable, resolveIssue]);

  // Approve page
  const approvePage = useCallback(() => {
    if (!project || !currentPage) return;
    const updated = updatePageStatus(project, currentPage.id, "approved", "admin");
    setProject(updated);

    const nextIndex = updated.pages.findIndex((p, i) =>
      i > currentPageIndex && p.status === "converted"
    );
    if (nextIndex >= 0) {
      setCurrentPageIndex(nextIndex);
      setResolvedIssues(new Set());
    }
  }, [project, currentPage, currentPageIndex]);

  // File upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const report = JSON.parse(text);
      const { createProjectFromCrawlReport } = await import("@/lib/migration/project");
      const newProject = createProjectFromCrawlReport(report);
      setProject(newProject);
      setCurrentPageIndex(0);
      setResolvedIssues(new Set());
      setError(null);

      // Extract theme
      const theme = extractThemeFromCrawl(report);
      setExtractedTheme(theme);
      setThemeConfirmed(false);
      setShowThemePanel(true);
    } catch (err) {
      setError("Failed to load crawl report");
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // No project state
  if (!project || project.pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Migration Workbench</h1>
          <p className="text-gray-400 mb-6">
            Load a crawl report to begin side-by-side migration review.
          </p>
          <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 text-lg">
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            Load Crawl Report
          </label>
          {error && <p className="mt-4 text-red-400">{error}</p>}
        </div>
      </div>
    );
  }

  const nav = getNavigationInfo(project, currentPage?.id || "");

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Project info */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold">{project.name}</h1>
              <p className="text-xs text-gray-400">
                Page {currentPageIndex + 1} of {project.pages.length}
                {currentPage && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                    currentPage.status === "approved" ? "bg-green-900 text-green-300" :
                    "bg-blue-900 text-blue-300"
                  }`}>
                    {getStatusInfo(currentPage.status).label}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Center: View mode */}
          <div className="flex items-center bg-gray-700 rounded-lg p-1">
            {(["split", "source", "preview", "issues"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === mode
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {mode === "split" ? "Split View" :
                 mode === "source" ? "Original" :
                 mode === "preview" ? "Preview" : "Issues"}
              </button>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Theme button */}
            <button
              onClick={() => setShowThemePanel(!showThemePanel)}
              className={`px-3 py-1.5 text-sm rounded ${
                showThemePanel ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              🎨 Theme
            </button>

            {/* Progress */}
            <div className="text-right">
              <span className="text-lg font-bold">{nav.progress.completed}</span>
              <span className="text-gray-400">/{nav.progress.total}</span>
            </div>

            <label className="px-3 py-1.5 text-sm bg-gray-700 rounded cursor-pointer hover:bg-gray-600">
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              Load
            </label>
          </div>
        </div>
      </header>

      {/* Theme Panel (collapsible) */}
      {showThemePanel && extractedTheme && (
        <ThemePanel
          theme={extractedTheme}
          confirmed={themeConfirmed}
          onConfirm={() => setThemeConfirmed(true)}
          onClose={() => setShowThemePanel(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Source Panel */}
        {(viewMode === "split" || viewMode === "source") && (
          <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} flex flex-col border-r border-gray-700`}>
            <div className="flex-none px-3 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Original (Wild Apricot)</span>
              <a
                href={currentPage?.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Open in new tab →
              </a>
            </div>
            <div className="flex-1 bg-white">
              {currentPage?.sourceUrl ? (
                <iframe
                  src={currentPage.sourceUrl}
                  className="w-full h-full border-0"
                  title="Original page"
                  sandbox="allow-same-origin allow-scripts"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No source URL available
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Panel */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div className={`${viewMode === "split" ? "w-1/2" : "w-full"} flex flex-col`}>
            <div className="flex-none px-3 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Murmurant Preview</span>
              <div className="flex items-center gap-2 text-xs">
                {autoFixable.length > 0 && (
                  <button
                    onClick={autoFixAll}
                    className="px-2 py-1 bg-green-700 hover:bg-green-600 rounded"
                  >
                    Auto-fix {autoFixable.length} issues
                  </button>
                )}
                <span className={needsReview.length > 0 ? "text-yellow-400" : "text-green-400"}>
                  {needsReview.length > 0 ? `${needsReview.length} need review` : "Ready"}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <PreviewPane
                page={currentPage}
                theme={extractedTheme}
                issues={unresolvedIssues}
                onResolveIssue={resolveIssue}
              />
            </div>
          </div>
        )}

        {/* Issues Panel (full width mode) */}
        {viewMode === "issues" && (
          <div className="w-full flex flex-col">
            <div className="flex-none px-3 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-sm font-medium text-gray-300">
                Issues for: {currentPage?.title || "Untitled"}
              </span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <IssuesList
                issues={unresolvedIssues}
                onResolve={resolveIssue}
                onAutoFixAll={autoFixAll}
                autoFixCount={autoFixable.length}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="flex-none bg-gray-800 border-t border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => goToPage(currentPageIndex - 1)}
            disabled={currentPageIndex === 0}
            className="px-4 py-2 text-sm bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-600"
          >
            ← Previous
          </button>

          {/* Page title and quick nav */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300 max-w-md truncate">
              {currentPage?.title || "Untitled"}
            </span>
            <select
              value={currentPageIndex}
              onChange={(e) => goToPage(parseInt(e.target.value, 10))}
              className="bg-gray-700 text-sm rounded px-2 py-1 text-white"
            >
              {project.pages.map((page, idx) => (
                <option key={page.id} value={idx}>
                  {idx + 1}. {page.title || "Untitled"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (project && currentPage) {
                  const updated = updatePageStatus(project, currentPage.id, "skipped", "admin");
                  setProject(updated);
                  goToPage(currentPageIndex + 1);
                }
              }}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
              Skip
            </button>
            <button
              onClick={approvePage}
              className={`px-4 py-2 text-sm rounded ${
                unresolvedIssues.length === 0
                  ? "bg-green-600 hover:bg-green-500"
                  : "bg-yellow-600 hover:bg-yellow-500"
              }`}
            >
              {unresolvedIssues.length === 0 ? "Approve" : `Approve (${unresolvedIssues.length} issues)`}
            </button>
            <button
              onClick={() => goToPage(currentPageIndex + 1)}
              disabled={currentPageIndex >= project.pages.length - 1}
              className="px-4 py-2 text-sm bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-600"
            >
              Next →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// Theme Panel Component
// ============================================================================

interface ThemePanelProps {
  theme: ExtractedTheme;
  confirmed: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function ThemePanel({ theme, confirmed, onConfirm, onClose }: ThemePanelProps) {
  return (
    <div className="flex-none bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-medium">Extracted Theme</h3>
            <span className="text-xs text-gray-400">
              Confidence: {Math.round(theme.confidence * 100)}%
            </span>
            {confirmed && (
              <span className="text-xs px-2 py-0.5 bg-green-900 text-green-300 rounded">
                Confirmed
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm">
            {/* Colors */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Colors:</span>
              {theme.primaryColor && (
                <div className="flex items-center gap-1">
                  <div
                    className="w-5 h-5 rounded border border-gray-600"
                    style={{ backgroundColor: theme.primaryColor }}
                    title={`Primary: ${theme.primaryColor}`}
                  />
                  <span className="text-xs text-gray-300">Primary</span>
                </div>
              )}
              {theme.accentColor && (
                <div className="flex items-center gap-1 ml-2">
                  <div
                    className="w-5 h-5 rounded border border-gray-600"
                    style={{ backgroundColor: theme.accentColor }}
                    title={`Accent: ${theme.accentColor}`}
                  />
                  <span className="text-xs text-gray-300">Accent</span>
                </div>
              )}
            </div>

            {/* Fonts */}
            {(theme.headingFont || theme.bodyFont) && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Fonts:</span>
                {theme.headingFont && (
                  <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                    Headings: {theme.headingFont}
                  </span>
                )}
                {theme.bodyFont && (
                  <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                    Body: {theme.bodyFont}
                  </span>
                )}
              </div>
            )}

            {/* Button styles */}
            {theme.buttonStyles.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Buttons:</span>
                <span className="text-xs text-gray-300">
                  {theme.buttonStyles.length} style(s) detected
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!confirmed && (
            <button
              onClick={onConfirm}
              className="px-3 py-1.5 text-sm bg-green-700 hover:bg-green-600 rounded"
            >
              Confirm Theme
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1.5 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Preview Pane Component
// ============================================================================

interface PreviewPaneProps {
  page: MigrationPage | null;
  theme: ExtractedTheme | null;
  issues: MigrationIssue[];
  onResolveIssue: (id: string, action: "accept" | "skip" | "remove") => void;
}

function PreviewPane({ page, theme, issues, onResolveIssue }: PreviewPaneProps) {
  if (!page) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No page selected
      </div>
    );
  }

  const blocks = page.convertedBlocks || [];
  const issuesByBlock = new Map<number, MigrationIssue[]>();
  for (const issue of issues) {
    const existing = issuesByBlock.get(issue.blockIndex) || [];
    existing.push(issue);
    issuesByBlock.set(issue.blockIndex, existing);
  }

  return (
    <div
      className="min-h-full p-6"
      style={{
        fontFamily: theme?.bodyFont || "system-ui",
        // Apply theme colors as CSS variables
        ["--theme-primary" as string]: theme?.primaryColor || "#3b82f6",
        ["--theme-accent" as string]: theme?.accentColor || "#10b981",
      }}
    >
      {/* Page title */}
      <h1
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: theme?.headingFont || "inherit" }}
      >
        {page.title || "Untitled Page"}
      </h1>

      {/* Blocks */}
      {blocks.length === 0 ? (
        <p className="text-gray-400 italic">No content blocks</p>
      ) : (
        blocks.map((block, index) => {
          const blockIssues = issuesByBlock.get(index) || [];
          const hasIssues = blockIssues.length > 0;

          return (
            <div
              key={block.id}
              className={`relative mb-4 ${hasIssues ? "ring-2 ring-yellow-400 ring-offset-2" : ""}`}
            >
              <BlockPreview block={block} theme={theme} />

              {/* Issue overlay */}
              {hasIssues && (
                <div className="absolute -right-2 -top-2 flex flex-col gap-1">
                  {blockIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="bg-yellow-500 text-black text-xs px-2 py-1 rounded shadow-lg flex items-center gap-2"
                    >
                      <span className="max-w-48 truncate">{issue.title}</span>
                      {issue.severity === "auto-fix" && (
                        <button
                          onClick={() => onResolveIssue(issue.id, issue.action.type === "remove" ? "remove" : "accept")}
                          className="bg-green-600 text-white px-1.5 py-0.5 rounded text-xs hover:bg-green-500"
                        >
                          Fix
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ============================================================================
// Block Preview Component
// ============================================================================

interface BlockPreviewProps {
  block: BaseBlock;
  theme: ExtractedTheme | null;
}

function BlockPreview({ block, theme }: BlockPreviewProps) {
  const data = block.data as Record<string, unknown>;

  // Helper for rendering headings dynamically
  const renderHeading = (level: number, text: string, style: CSSProperties) => {
    const className = `font-bold ${
      level === 1 ? "text-3xl" :
      level === 2 ? "text-2xl" :
      level === 3 ? "text-xl" :
      "text-lg"
    }`;

    switch (level) {
      case 1: return <h1 className={className} style={style}>{text}</h1>;
      case 2: return <h2 className={className} style={style}>{text}</h2>;
      case 3: return <h3 className={className} style={style}>{text}</h3>;
      case 4: return <h4 className={className} style={style}>{text}</h4>;
      case 5: return <h5 className={className} style={style}>{text}</h5>;
      default: return <h6 className={className} style={style}>{text}</h6>;
    }
  };

  switch (block.type) {
    case "heading":
      return renderHeading(
        (data.level as number) || 2,
        (data.text as string) || "Heading",
        {
          textAlign: (data.alignment as CSSProperties["textAlign"]) || "left",
          color: data.variant === "accent" ? theme?.accentColor : undefined,
          fontFamily: theme?.headingFont || "inherit",
        }
      );

    case "text":
    case "paragraph":
      return (
        <p
          className="text-gray-800 leading-relaxed"
          style={{ textAlign: (data.alignment as CSSProperties["textAlign"]) || "left" }}
        >
          {(data.content as string) || (data.text as string) || "Text content"}
        </p>
      );

    case "image": {
      const caption = data.caption as string | undefined;
      return (
        <figure>
          <img
            src={(data.src as string) || "/placeholder.jpg"}
            alt={(data.alt as string) || ""}
            className="max-w-full h-auto rounded"
          />
          {caption && (
            <figcaption className="text-sm text-gray-500 mt-1">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "button":
      return (
        <a
          href={(data.href as string) || "#"}
          className="inline-block px-6 py-3 rounded font-medium"
          style={{
            backgroundColor: data.variant === "secondary" ? "transparent" : theme?.primaryColor || "#3b82f6",
            color: data.variant === "secondary" ? theme?.primaryColor || "#3b82f6" : "white",
            border: data.variant === "secondary" ? `2px solid ${theme?.primaryColor || "#3b82f6"}` : "none",
          }}
        >
          {(data.text as string) || "Button"}
        </a>
      );

    case "divider":
      return <hr className="my-6 border-gray-300" />;

    case "video":
      return (
        <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-500">
            📹 {(data.platform as string) || "Video"}: {(data.videoId as string) || "..."}
          </span>
        </div>
      );

    case "html":
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: (data.content as string) || "" }}
        />
      );

    case "placeholder":
      return (
        <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded p-4 text-center">
          <span className="text-blue-600 font-medium">
            Widget: {(data.widgetType as string) || "Unknown"}
          </span>
        </div>
      );

    default:
      // Handle cta and other custom types that aren't in the block type enum
      if (data.href && data.text) {
        return (
          <a
            href={(data.href as string) || "#"}
            className="inline-block px-6 py-3 rounded font-medium"
            style={{
              backgroundColor: data.variant === "secondary" ? "transparent" : theme?.primaryColor || "#3b82f6",
              color: data.variant === "secondary" ? theme?.primaryColor || "#3b82f6" : "white",
              border: data.variant === "secondary" ? `2px solid ${theme?.primaryColor || "#3b82f6"}` : "none",
            }}
          >
            {(data.text as string) || "Button"}
          </a>
        );
      }
      return (
        <div className="bg-gray-100 border border-gray-300 rounded p-3 text-sm text-gray-600">
          Block type: {block.type}
        </div>
      );
  }
}

// ============================================================================
// Issues List Component
// ============================================================================

interface IssuesListProps {
  issues: MigrationIssue[];
  onResolve: (id: string, action: "accept" | "skip" | "remove") => void;
  onAutoFixAll: () => void;
  autoFixCount: number;
}

function IssuesList({ issues, onResolve, onAutoFixAll, autoFixCount }: IssuesListProps) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">✓</div>
        <h3 className="text-lg font-medium text-green-400">No issues remaining</h3>
        <p className="text-gray-400 mt-1">This page is ready to approve.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {autoFixCount > 0 && (
        <div className="flex items-center justify-between p-4 bg-green-900/30 border border-green-700 rounded-lg">
          <span className="text-green-300">
            {autoFixCount} issue(s) can be auto-fixed
          </span>
          <button
            onClick={onAutoFixAll}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-medium"
          >
            Auto-fix All
          </button>
        </div>
      )}

      {issues.map((issue) => (
        <div
          key={issue.id}
          className={`p-4 rounded-lg border ${
            issue.severity === "auto-fix"
              ? "bg-green-900/20 border-green-700"
              : issue.severity === "review"
              ? "bg-yellow-900/20 border-yellow-700"
              : "bg-red-900/20 border-red-700"
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-medium">{issue.title}</h4>
              <p className="text-sm text-gray-400 mt-1">{issue.description}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              issue.severity === "auto-fix"
                ? "bg-green-800 text-green-200"
                : issue.severity === "review"
                ? "bg-yellow-800 text-yellow-200"
                : "bg-red-800 text-red-200"
            }`}>
              {issue.severity === "auto-fix" ? "Auto-fix" : issue.severity === "review" ? "Review" : "Manual"}
            </span>
          </div>

          <div className="text-sm text-gray-300 mb-3">
            <strong>Recommendation:</strong> {issue.recommendation}
          </div>

          <div className="flex items-center gap-2">
            {issue.severity === "auto-fix" && (
              <button
                onClick={() => onResolve(issue.id, issue.action.type === "remove" ? "remove" : "accept")}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-sm"
              >
                {issue.action.label}
              </button>
            )}
            <button
              onClick={() => onResolve(issue.id, "skip")}
              className="px-3 py-1.5 text-gray-400 hover:text-white text-sm"
            >
              Skip
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Issue Extraction (unchanged)
// ============================================================================

function extractIssues(page: MigrationPage | null): MigrationIssue[] {
  if (!page?.convertedBlocks) return [];

  const issues: MigrationIssue[] = [];

  page.convertedBlocks.forEach((block, index) => {
    const data = block.data as Record<string, unknown>;

    if (block.type === "html") {
      const html = (data.content as string) || "";

      const scriptAnalyses = analyzeScriptsInBlock(html);
      for (const analysis of scriptAnalyses) {
        issues.push({
          id: `${block.id}-script-${issues.length}`,
          type: "script",
          blockIndex: index,
          severity: analysis.replacement?.type === "remove" ? "auto-fix" :
                   analysis.replacement?.type === "block" ? "auto-fix" : "manual",
          title: analysis.description,
          description: `This block contains JavaScript that ${getScriptExplanation(analysis.purpose)}. Inline scripts are not allowed for security reasons.`,
          recommendation: analysis.replacement?.instructions || "Review and remove this script.",
          action: {
            label: analysis.replacement?.action || "Remove",
            type: analysis.replacement?.type === "block" ? "replace" : "remove",
          },
          originalContent: analysis.snippet,
          suggestedReplacement: analysis.replacement?.blockType ? {
            blockType: analysis.replacement.blockType,
            blockData: {},
          } : undefined,
        });
      }

      const patterns = analyzeHtmlPatterns(html);
      for (const pattern of patterns) {
        if (pattern.replacement.type === "remove") {
          issues.push({
            id: `${block.id}-pattern-${issues.length}`,
            type: "html-pattern",
            blockIndex: index,
            severity: "auto-fix",
            title: pattern.description,
            description: "This block contains only styling with no actual content.",
            recommendation: pattern.replacement.action,
            action: { label: "Remove Block", type: "remove" },
            originalContent: pattern.originalHtml,
          });
          continue;
        }

        issues.push({
          id: `${block.id}-pattern-${issues.length}`,
          type: "html-pattern",
          blockIndex: index,
          severity: pattern.replacement.autoApply ? "auto-fix" : "review",
          title: pattern.description,
          description: pattern.replacement.type === "simplify"
            ? `This legacy HTML can be converted to a clean ${pattern.replacement.widgetType} block.`
            : `Detected ${pattern.description.toLowerCase()} that can be replaced with a native widget.`,
          recommendation: pattern.replacement.action,
          action: { label: pattern.replacement.action, type: "accept" },
          originalContent: pattern.originalHtml,
          suggestedReplacement: pattern.replacement.blockData ? {
            blockType: pattern.replacement.widgetType || "widget",
            blockData: pattern.replacement.blockData,
          } : undefined,
        });
      }

      if (scriptAnalyses.length === 0 && patterns.length === 0 && html.length > 100) {
        issues.push({
          id: `${block.id}-legacy`,
          type: "legacy-html",
          blockIndex: index,
          severity: "review",
          title: "Legacy HTML content",
          description: "This content is stored as raw HTML. It will work, but won't be editable in the visual editor.",
          recommendation: "Review if this content can be simplified into native blocks.",
          action: { label: "Keep as-is", type: "skip" },
          originalContent: html.substring(0, 500),
        });
      }
    }

    if (block.type === "placeholder") {
      issues.push({
        id: `${block.id}-widget`,
        type: "widget",
        blockIndex: index,
        severity: "auto-fix",
        title: `Widget: ${data.widgetType}`,
        description: `This ${data.sourceWidget} widget will be replaced with the native Murmurant ${data.widgetType} widget.`,
        recommendation: "This will be handled automatically.",
        action: { label: "Accept", type: "accept" },
        originalContent: `WA Widget: ${data.sourceWidget}`,
      });
    }
  });

  return issues;
}

function analyzeScriptsInBlock(html: string): ScriptAnalysis[] {
  const results: ScriptAnalysis[] = [];
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    if (match[1].trim()) {
      results.push(analyzeScript(match[1]));
    }
  }
  return results;
}

function getScriptExplanation(purpose: string): string {
  const explanations: Record<string, string> = {
    carousel: "creates an image carousel or slider",
    lightbox: "creates popup image viewing",
    accordion: "creates collapsible sections",
    tabs: "creates tabbed content",
    analytics: "tracks visitor behavior",
    countdown: "displays a countdown timer",
    "form-validation": "validates form inputs",
    "smooth-scroll": "enables smooth scrolling",
    "social-share": "adds social sharing buttons",
    modal: "creates popup dialogs",
    "lazy-load": "delays image loading",
    animation: "creates visual animations",
    "menu-toggle": "toggles mobile menus",
    unknown: "performs an unknown function",
  };
  return explanations[purpose] || "performs an unknown function";
}
