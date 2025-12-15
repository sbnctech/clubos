#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

echo "=== STATUS ==="
git status -sb
echo

echo "=== CURRENT BRANCH ==="
git rev-parse --abbrev-ref HEAD
echo

echo "=== LATEST 12 COMMITS ==="
git log --oneline -12
echo

echo "=== PRS (open) ==="
if command -v gh >/dev/null 2>&1; then
  gh pr list --limit 20
else
  echo "gh not installed"
fi
