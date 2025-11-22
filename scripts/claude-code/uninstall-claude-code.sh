#!/bin/bash
# uninstall-claude-code.sh - Remove poe-mcp-tool from Claude Code
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Removing poe-mcp-tool from Claude Code using native CLI..."

    if command -v claude >/dev/null 2>&1; then
        claude mcp remove poe
        log_success "Removed via Claude Code CLI"
        log_info "🔄 Restart Claude Code to apply changes"
    else
        log_error "Claude CLI not found. Install from: https://claude.com/claude-code"
        exit 1
    fi
}

main "$@"