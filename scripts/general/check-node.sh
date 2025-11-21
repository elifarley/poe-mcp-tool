#!/bin/bash
# check-node.sh - Validate Node.js version
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

NODE_MIN_VERSION="16.0.0"

main() {
    if command -v node >/dev/null 2>&1; then
        current_version=$(node --version | cut -d'v' -f2)
        if [[ "$current_version" < "$NODE_MIN_VERSION" ]]; then
            log_error "Node.js version $NODE_MIN_VERSION or higher required. Current: v$current_version"
            exit 1
        fi
        log_success "Node.js version check passed (v$current_version)"
    else
        log_error "Node.js is not installed"
        exit 1
    fi
}

main "$@"