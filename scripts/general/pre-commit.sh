#!/bin/bash
# pre-commit.sh - Run pre-commit checks
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Running pre-commit checks..."

    "$(dirname "$0")/lint.sh"
    "$(dirname "$0")/test.sh"

    log_success "Pre-commit checks passed"
}

main "$@"