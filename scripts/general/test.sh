#!/bin/bash
# test.sh - Run tests
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Running tests..."
    npm run test
    log_success "Tests completed"
}

main "$@"