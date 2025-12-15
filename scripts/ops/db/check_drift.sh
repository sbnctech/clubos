#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

echo "=== Prisma drift check (non-destructive) ==="
echo "This inspects schema/migration alignment. It should NOT modify DB."
echo

npx prisma migrate dev --create-only --name _drift_check_tmp >/tmp/prisma_drift_check.log 2>&1 || true

if grep -qi "Drift detected" /tmp/prisma_drift_check.log; then
  echo "DRIFT DETECTED"
  sed -n '1,220p' /tmp/prisma_drift_check.log
  exit 1
fi

echo "No drift detected (or prisma did not report drift)."
