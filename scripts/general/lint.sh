#!/bin/bash
# lint.sh - Run TypeScript type checking
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Running type checking..."
    npm run lint
    log_success "Type checking completed"
}

main "$@"