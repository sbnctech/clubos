#!/bin/zsh
#
# kill-next.sh - Kill running Next.js dev server processes
# macOS/zsh compatible, ASCII only
#

set -e

echo "=== kill-next.sh ==="

# Find and kill Next.js processes on common dev ports
PORTS="3000 3001 3002"

for PORT in $=PORTS; do
    echo "Checking port ${PORT}..."

    # Use lsof to find process on port (macOS compatible)
    PID=$(lsof -ti tcp:${PORT} 2>/dev/null || true)

    if [ -n "${PID}" ]; then
        echo "  Found process ${PID} on port ${PORT}"
        echo "  Killing process ${PID}..."
        kill -9 ${PID} 2>/dev/null || true
        echo "  Killed."
    else
        echo "  No process found on port ${PORT}"
    fi
done

# Also kill any node processes running next
echo ""
echo "Checking for Next.js node processes..."

# Find node processes with 'next' in command line
NEXT_PIDS=$(pgrep -f "node.*next" 2>/dev/null || true)

if [ -n "${NEXT_PIDS}" ]; then
    echo "  Found Next.js processes: ${NEXT_PIDS}"
    for PID in $=NEXT_PIDS; do
        echo "  Killing process ${PID}..."
        kill -9 ${PID} 2>/dev/null || true
    done
    echo "  Done."
else
    echo "  No Next.js node processes found"
fi

echo ""
echo "All Next.js processes terminated."
