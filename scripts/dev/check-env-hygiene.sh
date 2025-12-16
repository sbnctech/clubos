#!/bin/bash
#
# Check Test Environment Hygiene
#
# This script fails if tests contain direct process.env assignments,
# which cause TypeScript errors and can leak between tests.
#
# Charter P9: Fail closed - tests must be deterministic
#
# Usage: ./scripts/dev/check-env-hygiene.sh
#
# Correct pattern:
#   vi.stubEnv("NODE_ENV", "production");
#   vi.unstubAllEnvs(); // in afterEach
#
# Incorrect pattern (will fail this check):
#   process.env.NODE_ENV = "production";
#

set -euo pipefail

echo "== Test Environment Hygiene Check =="
echo ""

# Pattern to detect direct process.env assignments (not comparisons)
PATTERN='process\.env\.[A-Z_]+\s*=\s*[^=]'

# Search in tests directory
VIOLATIONS=$(grep -rn --include="*.ts" --include="*.tsx" -E "$PATTERN" tests/ 2>/dev/null || true)

if [ -n "$VIOLATIONS" ]; then
    echo "ERROR: Found direct process.env assignments in tests"
    echo ""
    echo "These cause TypeScript errors and can leak between tests."
    echo "Use vi.stubEnv() and vi.unstubAllEnvs() instead."
    echo ""
    echo "Violations:"
    echo "$VIOLATIONS"
    echo ""
    echo "Fix: Replace with:"
    echo '  vi.stubEnv("NODE_ENV", "production");'
    echo ""
    echo "  afterEach(() => {"
    echo "    vi.unstubAllEnvs();"
    echo "  });"
    echo ""
    exit 1
fi

echo "OK: No direct process.env assignments found in tests"
exit 0
