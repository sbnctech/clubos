#!/usr/bin/env bash
# ClubOS Intake Validation Runner
# Copyright (c) Santa Barbara Newcomers Club. All rights reserved.
#
# Validates an intake.json file and writes a timestamped report.
#
# Usage:
#   ./scripts/solutions/run_intake_validation.sh path/to/intake.json
#   ./scripts/solutions/run_intake_validation.sh path/to/intake.json --report-dir path/to/reports
#
# Exit codes:
#   0 - PASS
#   1 - FAIL (required fields missing)
#   2 - WARN (passed but critical flags detected)

set -euo pipefail

# Script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Defaults
VALIDATOR="$PROJECT_ROOT/scripts/solutions/validate_intake_schema.mjs"
DEFAULT_REPORT_DIR="$PROJECT_ROOT/docs/solutions/reports"

# Colors (if terminal supports them)
if [[ -t 1 ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    NC='\033[0m' # No Color
else
    RED=''
    GREEN=''
    YELLOW=''
    NC=''
fi

usage() {
    cat <<EOF
ClubOS Intake Validation Runner

Usage:
  $(basename "$0") <intake.json> [options]

Options:
  --report-dir <path>   Directory for report output (default: docs/solutions/reports)
  --no-report           Skip writing report file
  --help, -h            Show this help message

Examples:
  $(basename "$0") intake/SBNC/intake.json
  $(basename "$0") intake.json --report-dir ./reports

EOF
}

# Parse arguments
INTAKE_FILE=""
REPORT_DIR="$DEFAULT_REPORT_DIR"
WRITE_REPORT=true

while [[ $# -gt 0 ]]; do
    case "$1" in
        --report-dir)
            REPORT_DIR="$2"
            shift 2
            ;;
        --no-report)
            WRITE_REPORT=false
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        -*)
            echo "Unknown option: $1" >&2
            usage
            exit 1
            ;;
        *)
            if [[ -z "$INTAKE_FILE" ]]; then
                INTAKE_FILE="$1"
            else
                echo "Error: Multiple input files not supported" >&2
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate input
if [[ -z "$INTAKE_FILE" ]]; then
    echo "Error: No intake file specified" >&2
    usage
    exit 1
fi

if [[ ! -f "$INTAKE_FILE" ]]; then
    echo "Error: File not found: $INTAKE_FILE" >&2
    exit 1
fi

if [[ ! -f "$VALIDATOR" ]]; then
    echo "Error: Validator not found: $VALIDATOR" >&2
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not found" >&2
    exit 1
fi

# Create report directory if needed
if [[ "$WRITE_REPORT" == true ]]; then
    mkdir -p "$REPORT_DIR"
fi

# Generate timestamp for report
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORT_DIR/validation_$TIMESTAMP.txt"

# Run validation
echo "=========================================="
echo "ClubOS Intake Validation"
echo "=========================================="
echo ""
echo "Input:  $INTAKE_FILE"
if [[ "$WRITE_REPORT" == true ]]; then
    echo "Report: $REPORT_FILE"
fi
echo ""

# Capture output and exit code
set +e
VALIDATION_OUTPUT=$(node "$VALIDATOR" "$INTAKE_FILE" 2>&1)
EXIT_CODE=$?
set -e

# Display output
echo "$VALIDATION_OUTPUT"
echo ""

# Write report if enabled
if [[ "$WRITE_REPORT" == true ]]; then
    {
        echo "# Intake Validation Report"
        echo "Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
        echo "Input: $INTAKE_FILE"
        echo ""
        echo "$VALIDATION_OUTPUT"
    } > "$REPORT_FILE"
    echo "Report written to: $REPORT_FILE"
fi

# Summary
echo ""
echo "=========================================="
case $EXIT_CODE in
    0)
        echo -e "${GREEN}RESULT: PASS${NC}"
        ;;
    1)
        echo -e "${RED}RESULT: FAIL${NC}"
        ;;
    2)
        echo -e "${YELLOW}RESULT: WARN${NC}"
        ;;
    *)
        echo -e "${RED}RESULT: ERROR (exit code $EXIT_CODE)${NC}"
        ;;
esac
echo "=========================================="

exit $EXIT_CODE
