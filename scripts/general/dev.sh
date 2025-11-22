#!/bin/bash
# dev.sh - Development mode (build + run)
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Starting development mode..."
    npm run dev
}

main "$@"