#!/bin/zsh
#
# install-git-hooks.sh - Install Git pre-push hook for preflight checks
# macOS/zsh compatible, ASCII only
#
# This installs a pre-push hook that runs "make preflight" before each push.
# The push will be blocked if preflight fails.
#

SCRIPT_DIR="${0:A:h}"
PROJECT_ROOT="${SCRIPT_DIR}/../.."
cd "$PROJECT_ROOT" || exit 1

echo "=== install-git-hooks.sh ==="
echo ""

# Verify this is a Git repo
if [ ! -d ".git" ]; then
    echo "[ERROR] .git directory not found. Are you inside a Git clone?"
    exit 1
fi

HOOK_PATH=".git/hooks/pre-push"

# Handle existing pre-push hook
if [ -e "$HOOK_PATH" ]; then
    if [ ! -f "$HOOK_PATH" ]; then
        echo "[ERROR] $HOOK_PATH exists but is not a regular file."
        exit 1
    fi
    # Backup existing hook
    cp "$HOOK_PATH" "${HOOK_PATH}.backup"
    echo "Backed up existing pre-push hook to ${HOOK_PATH}.backup"
fi

# Write new pre-push hook
cat > "$HOOK_PATH" << 'EOF'
#!/bin/zsh
#
# Git pre-push hook - runs preflight checks before pushing
# Installed by: make install-hooks
#

echo "Running pre-push hook: make preflight"
echo ""

make preflight
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "Pre-push hook FAILED. Push blocked."
    echo "Fix the issues above and try again."
    exit 1
fi

echo ""
echo "Pre-push hook passed. Proceeding with push."
exit 0
EOF

# Make hook executable
chmod +x "$HOOK_PATH"

echo ""
echo "Installed Git pre-push hook to run \"make preflight\"."
echo ""
echo "Now, before each \"git push\", preflight checks will run automatically."
echo "If any check fails, the push will be blocked."
