#!/bin/zsh
#
# collect-diagnostics.sh - Collect environment and repo diagnostics
# macOS/zsh compatible, ASCII only
#
# Use this script to capture system state for debugging or when asking for help.
# This script is informational only and always exits 0.
#

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR}/../.."
cd "$PROJECT_ROOT" || exit 1

echo "=== collect-diagnostics.sh ==="
echo ""

# --- Basic Info ---
echo "--- Basic Info ---"
echo "Date/Time: $(date)"
echo "Directory: $(pwd)"
echo "OS Info: $(uname -a)"
echo ""

# --- Node / npm ---
echo "--- Node / npm ---"
if command -v node > /dev/null 2>&1; then
    echo "node: $(node -v)"
else
    echo "[WARN] node not found on PATH"
fi

if command -v npm > /dev/null 2>&1; then
    echo "npm: $(npm -v)"
else
    echo "[WARN] npm not found on PATH"
fi

if command -v npx > /dev/null 2>&1; then
    echo "npx: $(npx -v)"
else
    echo "[WARN] npx not found on PATH"
fi
echo ""

# --- Playwright / TypeScript ---
echo "--- Playwright / TypeScript ---"
if command -v npx > /dev/null 2>&1; then
    PW_VERSION=$(npx playwright --version 2>/dev/null)
    if [ -n "$PW_VERSION" ]; then
        echo "Playwright: $PW_VERSION"
    else
        echo "[WARN] Playwright not available via npx"
    fi

    TSC_VERSION=$(npx tsc --version 2>/dev/null)
    if [ -n "$TSC_VERSION" ]; then
        echo "TypeScript: $TSC_VERSION"
    else
        echo "[WARN] TypeScript not available via npx"
    fi
else
    echo "[WARN] npx not found, skipping Playwright/TypeScript checks"
fi
echo ""

# --- Git Status ---
echo "--- Git Status ---"
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Branch: $(git rev-parse --abbrev-ref HEAD)"
    echo "Commit: $(git rev-parse HEAD)"
    echo "Status:"
    git status --short
    if [ -z "$(git status --short)" ]; then
        echo "  (working tree clean)"
    fi
else
    echo "[WARN] Not inside a git repository"
fi
echo ""

# --- Files / Directories ---
echo "--- Files / Directories ---"
if [ -f ".env" ]; then
    echo ".env: exists"
else
    echo ".env: missing"
fi

if [ -d "node_modules" ]; then
    echo "node_modules: exists"
else
    echo "node_modules: missing"
fi

if [ -d ".next" ]; then
    echo ".next: exists"
else
    echo ".next: missing"
fi
echo ""

echo "=== Diagnostics complete ==="
exit 0
