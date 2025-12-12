#!/bin/zsh
#
# test-changed.sh - Run Playwright tests for changed spec files only
# macOS/zsh compatible, ASCII only
#
# Finds spec files changed relative to main and runs only those tests.
#

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR}/../.."
cd "$PROJECT_ROOT" || exit 1

echo "=== test-changed.sh ==="
echo ""

# Determine the base branch to compare against
BASE_BRANCH="main"

# Check if main branch exists
if ! git rev-parse --verify "$BASE_BRANCH" > /dev/null 2>&1; then
    echo "Branch 'main' not found. Trying upstream..."
    BASE_BRANCH=$(git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null)
    if [ -z "$BASE_BRANCH" ]; then
        echo "[ERROR] Could not determine base branch (no 'main' and no upstream configured)."
        echo "Make sure you have a 'main' branch or an upstream tracking branch."
        exit 1
    fi
    echo "Using upstream branch: $BASE_BRANCH"
fi

echo "Comparing against: $BASE_BRANCH"
echo ""

# Get list of changed files
CHANGED_FILES=$(git diff --name-only "$BASE_BRANCH"...HEAD 2>/dev/null)
if [ $? -ne 0 ]; then
    # Fallback: try simple diff against base branch
    CHANGED_FILES=$(git diff --name-only "$BASE_BRANCH" 2>/dev/null)
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to get changed files from git."
        exit 1
    fi
fi

# Also include uncommitted changes (staged and unstaged)
UNCOMMITTED_FILES=$(git diff --name-only HEAD 2>/dev/null)
STAGED_FILES=$(git diff --name-only --cached 2>/dev/null)

# Combine all changed files
ALL_CHANGED=$(echo "$CHANGED_FILES"$'\n'"$UNCOMMITTED_FILES"$'\n'"$STAGED_FILES" | sort -u)

# Filter to only spec files under tests/
SPEC_FILES=""
while IFS= read -r file; do
    # Skip empty lines
    [ -z "$file" ] && continue
    # Check if file is under tests/ and ends with .spec.ts
    if [[ "$file" == tests/*.spec.ts ]]; then
        # Verify file still exists
        if [ -f "$file" ]; then
            SPEC_FILES="$SPEC_FILES $file"
        fi
    fi
done <<< "$ALL_CHANGED"

# Trim leading whitespace
SPEC_FILES=$(echo "$SPEC_FILES" | xargs)

# Check if we have any spec files to run
if [ -z "$SPEC_FILES" ]; then
    echo "No changed spec files detected. Nothing to run."
    exit 0
fi

# Print the files we are about to test
echo "Changed spec files:"
for file in $=SPEC_FILES; do
    echo "  - $file"
done
echo ""

# Run Playwright on the changed spec files
echo "Running Playwright tests..."
echo ""
npx playwright test $=SPEC_FILES --reporter=line
EXIT_CODE=$?

exit $EXIT_CODE
