#!/bin/bash
# docs-build.sh - Build VitePress documentation
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Building documentation..."
    npm run docs:build
    log_success "Documentation built"
}

main "$@"