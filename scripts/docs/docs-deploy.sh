#!/bin/bash
# docs-deploy.sh - Deploy documentation to GitHub Pages
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Building documentation..."
    npm run docs:build

    log_info "Deploying documentation..."
    if command -v gh >/dev/null 2>&1; then
        cd docs && npx vitepress build
        gh-pages --dir .vitepress/dist --dist
    else
        log_error "gh-pages not installed. Run: npm install -g gh-pages"
        exit 1
    fi

    log_success "Documentation deployed"
}

main "$@"