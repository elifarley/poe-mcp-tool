# Installation

Multiple ways to install Poe MCP Tool, depending on your needs.

## Prerequisites

- Node.js v16.0.0 or higher
- Claude Desktop or Claude Code with MCP support
- Poe API key (get one from [poe.com](https://poe.com) settings)

## Method 1: Makefile Setup (Recommended for Developers)

The easiest way for developers working on this project:

```bash
# Clone the repository
git clone https://github.com/jamubc/poe-mcp-tool.git
cd poe-mcp-tool

# One-command setup (installs deps, validates Node.js, builds)
make setup

# Configure for Claude Code
make install-claude-code

# Start developing
make dev
```

**Benefits of Makefile Setup:**
- ✅ Automatic Node.js version validation
- ✅ Dependency installation and build
- ✅ Claude Code integration configuration
- ✅ Development environment setup
- ✅ One-command testing and deployment

## Method 2: NPX (Direct Usage)

No installation needed - runs directly in your MCP configuration:

```json
{
  "mcpServers": {
    "poe": {
      "command": "npx",
      "args": ["-y", "poe-mcp-tool"],
      "env": {
        "POE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Method 3: Global Installation

```bash
npm install -g poe-mcp-tool
```

Then configure your MCP client:
```json
{
  "mcpServers": {
    "poe": {
      "command": "poe-mcp-tool",
      "env": {
        "POE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Method 4: Local Project

```bash
npm install poe-mcp-tool
```

For integration in existing projects.

## Claude Code Integration

### Using Makefile (Recommended)

```bash
# Auto-configure Claude Code (simple CLI method)
make install-claude-code

# Check status
make status-claude-code

# Test integration
make test-claude-code
```

### Manual Claude CLI Installation

If you prefer to use Claude CLI directly instead of the Makefile:

```bash
# Install Claude CLI (if not already installed)
npm install -g @anthropic-ai/claude-code

# Install MCP server
claude mcp add --transport stdio poe --env POE_API_KEY=$POE_API_KEY -- npx -y poe-mcp-tool

# List configured servers
claude mcp list
```

### Manual Configuration

Add to `~/.config/claude-code/mcp.json`:

```json
{
  "mcpServers": {
    "poe": {
      "command": "npx",
      "args": ["-y", "poe-mcp-tool"],
      "env": {
        "POE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Development Environment

For contributors and developers working on this project:

### Quick Development Setup

```bash
# Clone and setup
git clone https://github.com/jamubc/poe-mcp-tool.git
cd poe-mcp-tool
make setup

# Development workflow
make dev          # Start with hot reload
make test         # Run tests
make lint         # Type checking
make pre-commit   # All checks before commit
```

### Common Development Commands

| Command | Purpose |
|---------|---------|
| `make setup` | First-time project setup |
| `make build` | Compile TypeScript |
| `make clean` | Remove build artifacts |
| `make watch` | Watch for changes |
| `make test` | Run tests |
| `make lint` | TypeScript type checking |
| `make format` | Format code (if prettier available) |
| `make release` | Full release workflow |

## Environment Variables

Set your Poe API key:

```bash
# Linux/macOS
export POE_API_KEY=your_api_key_here

# Windows
set POE_API_KEY=your_api_key_here
```

Or add to your MCP client's `env` configuration section.

See [Getting Started](/getting-started) for full usage instructions.