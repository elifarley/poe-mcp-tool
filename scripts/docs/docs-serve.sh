#!/bin/bash
# docs-serve.sh - Serve documentation locally
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Serving documentation locally..."
    npm run docs:dev
}

main "$@"