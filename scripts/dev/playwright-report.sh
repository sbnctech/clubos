#!/bin/zsh
#
# playwright-report.sh - Open Playwright HTML report
# macOS/zsh compatible, ASCII only
#

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR}/../.."
cd "$PROJECT_ROOT" || exit 1

echo "=== playwright-report.sh ==="
echo ""

if [ -d "playwright-report" ]; then
    echo "Opening Playwright HTML report..."
    npx playwright show-report
else
    echo "No Playwright report found. Run 'npx playwright test --reporter=html' first."
fi
