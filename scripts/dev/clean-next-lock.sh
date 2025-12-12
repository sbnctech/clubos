#!/bin/zsh
#
# clean-next-lock.sh - Remove Next.js cache and lock files
# macOS/zsh compatible, ASCII only
#

set -e

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR}/../.."

echo "=== clean-next-lock.sh ==="
echo "Project root: ${PROJECT_ROOT}"

cd "${PROJECT_ROOT}"

# Remove .next build cache
if [ -d ".next" ]; then
    echo "Removing .next directory..."
    rm -rf .next
    echo "  Removed .next"
else
    echo "  .next directory not found (skipping)"
fi

# Remove package-lock.json if requested
if [ "$1" = "--lock" ] || [ "$1" = "-l" ]; then
    if [ -f "package-lock.json" ]; then
        echo "Removing package-lock.json..."
        rm -f package-lock.json
        echo "  Removed package-lock.json"
    else
        echo "  package-lock.json not found (skipping)"
    fi
fi

# Remove node_modules/.cache if it exists
if [ -d "node_modules/.cache" ]; then
    echo "Removing node_modules/.cache..."
    rm -rf node_modules/.cache
    echo "  Removed node_modules/.cache"
else
    echo "  node_modules/.cache not found (skipping)"
fi

# Remove tsconfig.tsbuildinfo if it exists
if [ -f "tsconfig.tsbuildinfo" ]; then
    echo "Removing tsconfig.tsbuildinfo..."
    rm -f tsconfig.tsbuildinfo
    echo "  Removed tsconfig.tsbuildinfo"
fi

echo ""
echo "Done. Next.js cache cleaned."
echo ""
echo "Usage: $0 [--lock|-l]"
echo "  --lock, -l  Also remove package-lock.json"
