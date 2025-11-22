#!/bin/bash
# test-claude-code.sh - Test Claude Code integration
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Testing Claude Code integration..."

    if command -v claude >/dev/null 2>&1; then
        if claude mcp list | grep -q "poe"; then
            log_success "✅ poe-mcp-tool found in Claude Code configuration"
            log_info "💡 Test by running: /mcp in Claude Code"
        else
            log_error "❌ poe-mcp-tool not configured"
            log_info "💡 Run 'make install-claude-code' first"
        fi
    else
        log_error "❌ Claude CLI not found"
        log_info "💡 Install from: https://claude.com/claude-code"
        exit 1
    fi
}

main "$@"