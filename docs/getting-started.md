## Getting Started

<div align="center">⇣ Find your setup ↴</div>

<ClientGrid>
  <div class="client-card client-card--recommended claude-code-card">
    <h3><span class="snowflake">❋</span> Claude Code</h3>
    <div class="client-badge">Power Users</div>
    <p>One-command setup</p>
    <a href="#claude-code-recommended" class="client-button">Get Started →</a>
  </div>
  
  <div class="client-card">
    <h3>🖥️ <br>Claude Desktop</h3>
    <div class="client-badge">Everyday users</div>
    <p>JSON configuration</p>
    <a href="#claude-desktop" class="client-button">Setup Guide →</a>
  </div>
  
  <div class="client-card">
    <h3>📂 Other Clients</h3>
    <div class="client-badge">40+ Options</div>
    <p>Warp, Copilot, and More</p>
    <a href="#other-mcp-clients" class="client-button">More →</a>
  </div>
</ClientGrid>

## Client Setup

## Prerequisites

Before installing, ensure you have:

- **[Node.js](https://nodejs.org/)** v16.0.0 or higher
- **[Poe API Key](https://poe.com)** (get one from Poe settings)
- **[Claude Desktop](https://claude.ai/download)** or **[Claude Code](https://www.anthropic.com/claude-code)** with MCP support

### For Developers Working on This Project

If you're contributing to poe-mcp-tool, use the Makefile workflow:

```bash
# Clone and set up development environment
git clone https://github.com/jamubc/poe-mcp-tool.git
cd poe-mcp-tool

# One-command setup (installs deps, validates Node.js, builds)
make setup

# Configure for Claude Code (optional)
make install-claude-code

# Start development
make dev
```

See [Development Workflow](/usage/development-workflow) for complete developer guide.


## Claude Code (Recommended)
::: tip 💡 poe-mcp-tool is designed for seamless Claude Code integration
:::
Claude Code offers the smoothest experience with agentic delegation.

### Method 1: One-Command Installation

```bash
# Install for Claude Code using Makefile (recommended)
make install-claude-code

# Start Claude Code - it's automatically configured!
claude
```

### Method 2: Manual Installation

```bash
# Install for Claude Code
claude mcp add poe -- npx -y poe-mcp-tool

# Start Claude Code
claude
```

### Method 3: Manual Configuration

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

Set your API key:
```bash
export POE_API_KEY=your_api_key_here
```

## Claude Desktop
---
#### Configuration File Locations

<ConfigModal>

*Where are my Claude Desktop Config Files?:*

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

</ConfigModal>

---

For Claude Desktop users, add this to your configuration file:

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

::: warning
You must restart Claude Desktop ***completely*** for changes to take effect.
:::
## Other MCP Clients

Poe MCP Tool works with 40+ MCP clients! Here are the common configuration patterns:

### STDIO Transport (Most Common)
```json
{
  "transport": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "poe-mcp-tool"],
    "env": {
      "POE_API_KEY": "your_api_key_here"
    }
  }
}
```

### Popular Clients

<details>
<summary><strong>Warp</strong> - Modern terminal with AI features</summary>

**Configuration Location:** Terminal Settings → AI Settings → MCP Configuration

```json
{
  "poe": {
    "command": "npx",
    "args": [
      "-y",
      "poe-mcp-tool"
    ],
    "env": {
      "POE_API_KEY": "your_api_key_here"
    },
    "working_directory": null,
    "start_on_launch": true
  }
}
```

**Features:** Terminal-native MCP integration, AI-powered command suggestions
</details>
### Generic Setup Steps

1. **Get Poe API Key**: Get one from [poe.com](https://poe.com) settings
2. **Add Server Config**: Use the STDIO transport pattern above
3. **Restart Client**: Most clients require restart after config changes
4. **Test Connection**: Try natural language commands with Poe models

## Verify Your Setup

Once configured, test that everything is working:

### 1. Basic Connectivity Test
Type in Claude:
```
"Use Poe to analyze this file" @README.md
```

### 2. Test File Analysis
```
"Ask GPT-5.1-Codex to review my Python script"
```

### 3. Test Brainstorming
```
"Brainstorm API improvements using SCAMPER methodology with Poe"
```

## Quick Command Reference

Once installed, you can use natural language or slash commands:

### Natural Language Examples
- "Use Poe to analyze this codebase"
- "Ask GPT-5.1-Codex to review my Python script"
- "Use Gemini 3.0 Pro to summarize this documentation"

### Available Tools
- `analyze-with-poe` - Main analysis with multiple models
- `brainstorm-with-poe` - Structured brainstorming frameworks
- `ping` - Test MCP server connectivity
- `help` - Show available tools and usage

## Need a Different Client?

Don't see your MCP client listed? Poe MCP Tool uses standard MCP protocol and works with any compatible client.

::: tip Find More MCP Clients
- **Official List**: [modelcontextprotocol.io/clients](https://modelcontextprotocol.io/clients)
- **Configuration Help**: Most clients follow the STDIO transport pattern above
- **Community**: Join discussions on GitHub for client-specific tips
:::

## Common Issues

### "Command not found: gemini"
Make sure you've installed the Gemini CLI:
```bash
npm install -g @google/gemini-cli
```

### "MCP server not responding"
0. run claude code --> /doctor
1. Check your configuration file path
2. Ensure JSON syntax is correct
3. Restart your MCP client completely
4. Verify Gemini CLI works: `gemini -help`


### Client-Specific Issues
- **Claude Desktop**: Must restart completely after config changes
- **Other Clients**: Check their specific documentation for MCP setup

## Next Steps

Now that you're set up:
- Learn about file analysis with @ syntax
- Explore sandbox mode for safe code execution
- Check out real-world examples in the README
- Join the community for support

::: info Need Help?
If you run into issues, [open an issue](https://github.com/jamubc/gemini-mcp-tool/issues) on GitHub.
:::