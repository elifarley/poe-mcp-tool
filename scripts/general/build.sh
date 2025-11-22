#!/bin/bash
# build.sh - Compile TypeScript to dist/
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Building $(PROJECT_NAME)..."
    npm run build
    log_success "Build completed"
}

main "$@"