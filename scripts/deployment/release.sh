#!/bin/bash
# release.sh - Full release workflow
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

VERSION="${1:-}"
PACKAGE_NAME="${2:-}"

main() {
    validate_required_args "VERSION" "PACKAGE_NAME"
    log_info "Creating release $(VERSION)..."

    log_info "Checking git status..."
    hug sl

    read -p "Are these changes ready for release? (y/N) " confirm
    if [[ "$confirm" != "y" ]]; then
        log_info "Release cancelled"
        exit 0
    fi

    log_info "Creating git tag..."
    hug tag -a "v$(VERSION)" -m "Release v$(VERSION)"

    log_info "Publishing to npm..."
    npm publish

    log_info "Pushing changes and tags..."
    hug bpush
    hug push --tags

    log_success "Release $(VERSION) completed"
}

main "$@"