#!/bin/zsh
#
# playwright-clean.sh - Remove Playwright test artifacts
# macOS/zsh compatible, ASCII only
#

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR}/../.."
cd "$PROJECT_ROOT" || exit 1

echo "=== playwright-clean.sh ==="
echo ""

# Remove test-results directory
if [ -d "test-results" ]; then
    echo "Removing test-results..."
    rm -rf test-results
else
    echo "test-results not found (skipping)"
fi

# Remove playwright-report directory
if [ -d "playwright-report" ]; then
    echo "Removing playwright-report..."
    rm -rf playwright-report
else
    echo "playwright-report not found (skipping)"
fi

echo ""
echo "Playwright artifacts cleanup complete."
