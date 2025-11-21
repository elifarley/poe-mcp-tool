#!/bin/bash
# status-claude-code.sh - Check Claude Code MCP configuration status
set -euo pipefail

source "$(dirname "$0")/../lib/common.sh"

main() {
    log_info "Claude Code MCP Configuration Status:"

    if command -v claude >/dev/null 2>&1; then
        log_info "Available servers:"
        claude mcp list | sed 's/^/  • /' || echo "  No servers configured"

        if claude mcp list | grep -q "poe"; then
            log_success "✅ poe-mcp-tool is configured"
        else
            log_info "❌ poe-mcp-tool not configured"
        fi
    else
        log_error "❌ Claude CLI not available"
        log_info "💡 Install from: https://claude.com/claude-code"
    fi
}

main "$@"