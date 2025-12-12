#!/bin/zsh
#
# smoke.sh - Quick smoke tests for local confidence
# macOS/zsh compatible, ASCII only
#
# Runs: doctor, types, lint, and a small subset of core tests.
# Use this before starting a session or before committing.
#

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR}/../.."
cd "$PROJECT_ROOT" || exit 1

echo "=== smoke.sh ==="
echo ""

# Step 1: Doctor
echo "[1/4] Doctor..."
"${SCRIPT_DIR}/doctor.sh"
if [ $? -ne 0 ]; then
    echo ""
    echo "Smoke FAILED at step 1 (Doctor)."
    exit 1
fi
echo ""

# Step 2: TypeScript
echo "[2/4] TypeScript (types)..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo ""
    echo "Smoke FAILED at step 2 (TypeScript)."
    exit 1
fi
echo "TypeScript: OK"
echo ""

# Step 3: ESLint
echo "[3/4] ESLint (lint)..."
npx eslint . --max-warnings=0
if [ $? -ne 0 ]; then
    echo ""
    echo "Smoke FAILED at step 3 (ESLint)."
    exit 1
fi
echo "ESLint: OK"
echo ""

# Step 4: Targeted Playwright tests
echo "[4/4] Playwright (API + key admin tests)..."
npx playwright test \
    tests/api/admin-summary.spec.ts \
    tests/api/admin-dashboard.spec.ts \
    tests/admin/admin-page-loaded.spec.ts \
    tests/admin/admin-summary.spec.ts \
    --reporter=line
if [ $? -ne 0 ]; then
    echo ""
    echo "Smoke FAILED at step 4 (Playwright)."
    exit 1
fi
echo ""

# All passed
echo "========================================"
echo "Smoke PASSED: environment and core flows look good."
echo "========================================"
exit 0
