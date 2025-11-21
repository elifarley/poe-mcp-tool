#!/bin/bash
# install-claude-code.sh - Install poe-mcp-tool for Claude Code
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Installing poe-mcp-tool for Claude Code using native CLI..."

    if command -v claude >/dev/null 2>&1; then
        claude mcp add --transport stdio poe --env POE_API_KEY=${POE_API_KEY:-} -- npx -y poe-mcp-tool
        log_success "Installed via Claude Code CLI"
        log_info "🔄 Restart Claude Code to apply changes"
    else
        log_error "Claude CLI not found. Install from: https://claude.com/claude-code"
        exit 1
    fi
}

main "$@"