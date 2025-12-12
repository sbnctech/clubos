#!/bin/zsh
#
# reset-dev.sh - Full development environment reset
# macOS/zsh compatible, ASCII only
#
# This script:
#   1. Kills any running Next.js processes
#   2. Cleans Next.js cache and build artifacts
#   3. Optionally reinstalls node_modules
#

set -e

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR}/../.."

echo "=========================================="
echo "  reset-dev.sh - Full Dev Reset"
echo "=========================================="
echo ""
echo "Project root: ${PROJECT_ROOT}"
echo ""

cd "${PROJECT_ROOT}"

# Step 1: Kill running processes
echo "[1/4] Killing running Next.js processes..."
"${SCRIPT_DIR}/kill-next.sh"
echo ""

# Step 2: Clean Next.js cache
echo "[2/4] Cleaning Next.js cache..."
"${SCRIPT_DIR}/clean-next-lock.sh"
echo ""

# Step 3: Optionally remove and reinstall node_modules
if [ "$1" = "--full" ] || [ "$1" = "-f" ]; then
    echo "[3/4] Removing node_modules (full reset)..."
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        echo "  Removed node_modules"
    else
        echo "  node_modules not found (skipping)"
    fi

    echo ""
    echo "[4/4] Reinstalling dependencies..."
    npm install
    echo "  Dependencies installed"
else
    echo "[3/4] Skipping node_modules removal (use --full for complete reset)"
    echo "[4/4] Skipping npm install"
fi

echo ""
echo "=========================================="
echo "  Reset complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  npm run dev     # Start development server"
echo "  make dev        # Or use make target"
echo ""
echo "Usage: $0 [--full|-f]"
echo "  --full, -f  Also remove and reinstall node_modules"
