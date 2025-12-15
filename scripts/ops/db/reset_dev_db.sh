#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

echo "=== LOCAL DEV DB RESET (DANGEROUS) ==="
echo "This will drop and recreate the LOCAL dev DB."
echo

if [ "${PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION:-}" != "yes" ]; then
  echo "ERROR: Set PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION=yes to proceed."
  exit 2
fi

npx prisma migrate reset --force
npx prisma migrate dev
npx prisma generate

if npm run -s | grep -qE "^  db:seed$"; then
  npm run db:seed
fi

echo "DONE: reset + migrate + generate (+ seed if available)"
