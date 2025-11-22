#!/bin/bash
# setup.sh - First-time project setup
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Setting up poe-mcp-tool for development..."

    log_info "Installing dependencies..."
    npm install

    log_info "Running initial build..."
    npm run build

    log_success "Setup completed!"
    log_info ""
    log_info "🎯 Next steps:"
    log_info "  1. Set your Poe API key: export POE_API_KEY=your_key_here"
    log_info "  2. Install for Claude Code: make install-claude-code"
    log_info "  3. Run tests: make test"
    log_info "  4. Start developing: make dev"
}

main "$@"