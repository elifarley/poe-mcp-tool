#!/bin/bash
# watch.sh - Watch for changes and rebuild
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Watching for changes..."
    npx tsc --watch
}

main "$@"