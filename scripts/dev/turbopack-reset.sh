#!/bin/zsh
#
# turbopack-reset.sh - Reset Turbopack and Next.js cache
# macOS/zsh compatible, ASCII only
#
# Use this script when:
#   - Turbopack gets stuck or behaves unexpectedly
#   - Hot reload stops working
#   - Build artifacts become corrupted
#   - After switching branches with major changes
#

set -e

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR}/../.."

echo "=== turbopack-reset.sh ==="
echo "Project root: ${PROJECT_ROOT}"
echo ""

cd "${PROJECT_ROOT}"

# Track if anything was removed
REMOVED_SOMETHING=false

# Remove .next/cache (Turbopack cache)
if [ -d ".next/cache" ]; then
    echo "Removing .next/cache..."
    rm -rf .next/cache
    echo "  Removed .next/cache"
    REMOVED_SOMETHING=true
else
    echo "  .next/cache not found (skipping)"
fi

# Remove .next/server (server build artifacts)
if [ -d ".next/server" ]; then
    echo "Removing .next/server..."
    rm -rf .next/server
    echo "  Removed .next/server"
    REMOVED_SOMETHING=true
else
    echo "  .next/server not found (skipping)"
fi

# Remove Turbopack lock files
echo "Checking for Turbopack lock files..."
if [ -d ".next" ]; then
    # Use find for safe glob handling (no error if no matches)
    find .next -maxdepth 1 -name ".turbopack-*" -o -name "turbopack-*" -o -name "*.lock" 2>/dev/null | while read -r file; do
        if [ -e "$file" ]; then
            echo "  Removing lock file: $file"
            rm -f "$file"
            REMOVED_SOMETHING=true
        fi
    done
fi

# Remove entire .next directory
if [ -d ".next" ]; then
    echo "Removing .next directory..."
    rm -rf .next
    echo "  Removed .next"
    REMOVED_SOMETHING=true
else
    echo "  .next directory not found (skipping)"
fi

# Remove trace files if present
if [ -f ".next-trace" ]; then
    echo "Removing .next-trace..."
    rm -f .next-trace
    echo "  Removed .next-trace"
    REMOVED_SOMETHING=true
fi

echo ""
if [ "$REMOVED_SOMETHING" = true ]; then
    echo "Turbopack reset complete."
    echo ""
    echo "Next steps:"
    echo "  npm run dev     # Restart dev server (will rebuild)"
    echo "  make dev        # Or use make target"
else
    echo "Nothing to clean - cache was already clear."
fi
