#!/bin/bash
# publish.sh - Publish to npm with safety checks
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Publishing to npm..."

    if [[ -z "$(POE_API_KEY)" ]]; then
        log_warning "Warning: POE_API_KEY not set for testing"
    fi

    npm run prepublishOnly
    npm publish

    log_success "Published $(PACKAGE_NAME)@$(VERSION) to npm"
}

main "$@"