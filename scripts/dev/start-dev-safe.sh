#!/bin/zsh
#
# start-dev-safe.sh - Safe development server startup
# macOS/zsh compatible, ASCII only
#
# Runs environment checks, kills stale processes, resets cache,
# then starts the development server.
#

SCRIPT_DIR="${0:A:h}"

echo "=== start-dev-safe.sh ==="
echo ""

# Step 1: Run doctor
echo "[1/4] Running environment doctor..."
"${SCRIPT_DIR}/doctor.sh"
DOCTOR_EXIT=$?

if [ "$DOCTOR_EXIT" -ne 0 ]; then
    echo ""
    echo "Doctor check failed. Please fix the issues above before starting dev."
    exit 1
fi

echo ""

# Step 2: Kill any running Next.js processes
echo "[2/4] Killing any running Next.js processes..."
"${SCRIPT_DIR}/kill-next.sh"
echo ""

# Step 3: Reset Turbopack cache
echo "[3/4] Resetting Turbopack cache..."
"${SCRIPT_DIR}/turbopack-reset.sh"
echo ""

# Step 4: Start dev server
echo "[4/4] Starting development server..."
echo ""
exec npm run dev
