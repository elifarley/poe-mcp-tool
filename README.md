# Poe MCP Tool

<div align="center">

[![npm version](https://img.shields.io/npm/v/poe-mcp-tool)](https://www.npmjs.com/package/poe-mcp-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://img.shields.io/badge/Open%20Source-❤️-red.svg)](https://github.com/jamubc/poe-mcp-tool)

</div>

> **Access 8+ AI models through one MCP server**: Claude Sonnet 4.5, GPT-5.1, GPT-5.1-Codex, Gemini 3.0 Pro, Grok-4, and more via [Poe API](https://poe.com)

This is a Model Context Protocol (MCP) server that provides access to Poe's multi-model AI platform through **agentic delegation** - your main LLM can call specialized Poe models as tools for specific tasks.

### Three Use Cases

| Client | Value Proposition | Tier |
|--------|-------------------|------|
| **Cursor** | 🐛 **Critical Bug Fix**: Workaround for [Global Override Bug](https://forum.cursor.com/t/override-openai-base-url-breaks-requests-when-pointing-to-openrouter/142520) that breaks native Poe integration | Tier 1 |
| **Continue** | 🔧 **Agentic Upgrade**: Local models delegate complex tasks to Poe bots as tools | Tier 2 |
| **Claude Code** | 🤝 **Collaborative Intelligence**: Use with poe-code - Sonnet delegates to Gemini 3.0 Pro for massive context | Tier 2 |

**Key Features**:
- 🤝 **Agentic Delegation**: Let your main LLM delegate tasks to specialized Poe models as tools
- 🐛 **Cursor Bug Workaround**: Stable Poe access without breaking native IDE features
- 🎯 **8+ Premium Models**: Access Claude, GPT-5, Codex, Gemini, Grok, and more
- 🧠 **Brainstorming Tools**: SCAMPER, Design Thinking, Divergent/Convergent frameworks
- 🔄 **Smart Auto-Routing**: Automatically route queries to the best model for the task
- ⚡ **High Performance**: Direct API integration (2-5x faster than CLI-based approaches)

## Why MCP Tools vs Model Switching?

**Model Switching** (like `/model` in Claude Code via poe-code):
- Switches your entire conversation to a different model
- One model at a time

**MCP Tools** (this project - poe-mcp-tool):
- Your main model **delegates** specific tasks to other models
- **Collaborative intelligence** - multiple models working together

### Agentic Delegation Example

```typescript
User: "Analyze this 50K line codebase"
↓
Claude Sonnet (main): "This exceeds my context window. I'll delegate to Gemini 3.0 Pro"
↓
Sonnet calls MCP tool: ask_poe_bot({
  model: "Gemini-3.0-Pro",  // 2M token context
  query: "Analyze architecture and dependencies",
  files: ["@entire/codebase"]
})
↓
Gemini processes massive context → returns summary → Sonnet synthesizes
```

**Real-World Use Cases**:
- **Cursor users**: Stable Poe access without breaking autocomplete (bug workaround)
- **Continue users**: Local Llama-3 delegates reasoning to Claude/GPT-5 tools
- **Claude Code users**: Sonnet delegates large context tasks to Gemini 3.0 Pro
- **All users**: Brainstorming with SCAMPER, multi-model comparison, auto-routing

## Prerequisites

Before using this tool, ensure you have:

1. **[Node.js](https://nodejs.org/)** (v16.0.0 or higher)
2. **Poe API Key** (get one from [poe.com](https://poe.com) settings)

### Getting Your Poe API Key

1. Sign up at [poe.com](https://poe.com)
2. Navigate to Settings → API
3. Generate an API key
4. Set environment variable:
   ```bash
   export POE_API_KEY=your_api_key_here
   ```

## Quick Start

### For Developers (Makefile Workflow)

If you're a developer working on this project, use the Makefile for streamlined development:

```bash
# One-command setup
make setup

# Install for Claude Code
make install-claude-code

# Start development with hot reload
make dev

# Run tests and linting
make test
make lint
```

**⚡ Why use Makefile?**
- 🚀 Automated setup and dependency management
- 🔧 Built-in Node.js version validation
- 📦 Seamless Claude Code integration
- 🏷️  Safe release workflow with git tagging
- 🧪 One-command testing and linting

<details>
<summary>👀 See all Makefile commands</summary>

Run `make help` to see all available commands, including build, deploy, and Claude Code integration targets.

</details>

---

### For Users (Direct Installation)

#### For Cursor (Primary Use Case - Bug Workaround)

Add to Cursor's MCP settings (`.cursor/mcp.json` or via Cursor settings UI):

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

**Why Cursor needs this**: Cursor's "Override OpenAI Base URL" feature has a [critical bug](https://forum.cursor.com/t/override-openai-base-url-breaks-requests-when-pointing-to-openrouter/142520) - it forces ALL traffic (including internal calls for `cursor-small` autocomplete and `cpp` prediction) to your custom endpoint. Since Poe doesn't host these proprietary models, your IDE's features break.

**The MCP Fix**: poe-mcp-tool runs on a separate channel (Stdio/SSE, not HTTP), so:
- ✅ Native Cursor features stay intact (pointing to default providers)
- ✅ Access Poe models as tools in Composer without breaking anything

---

## Configuration

### For Continue (Agentic Upgrade)

Add to Continue's config (`~/.continue/config.json`):

```json
{
  "mcpServers": [
    {
      "name": "poe",
      "command": "npx",
      "args": ["-y", "poe-mcp-tool"],
      "env": {
        "POE_API_KEY": "your_api_key_here"
      }
    }
  ]
}
```

**Why Continue users benefit**: Continue natively supports Poe as a chat bot, but poe-mcp-tool treats Poe as **agents with tools**. This enables hybrid orchestration:
- Run free local model (Llama-3-8B) for privacy and speed
- Delegate complex reasoning to Poe bots (Claude/GPT-5) via MCP tools
- Optimize cost: only pay Poe for hard tasks

### For Claude Code (Collaborative Intelligence)

**Important**: Use **BOTH** poe-code AND poe-mcp-tool together.

```bash
# 1. Install poe-code for model switching
poe-code configure claude-code

# 2. Add poe-mcp-tool for agentic delegation
claude mcp add poe -- npx -y poe-mcp-tool
```

Or manually add to `~/.config/claude-code/mcp.json`:

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

**Why Claude Code users benefit**: With poe-code, you get `/model` switching. With poe-mcp-tool, Sonnet can **delegate** to other models:
- Sonnet analyzes 50K line codebase by calling Gemini 3.0 Pro tool (2M context window)
- GPT-5.1-Codex handles refactoring via tool call while Sonnet manages conversation
- Multi-model collaboration on complex architectural decisions

**Verify Installation**: Type `/mcp` inside Claude Code to see poe MCP server listed.

After updating any configuration, restart your MCP client.

---

## Available Models

| Model | Best For | Speed |
|-------|----------|-------|
| **Claude-Sonnet-4.5** (default) | General analysis, writing, reasoning | Fast |
| **GPT-5.1** | Complex reasoning, research | Medium |
| **GPT-5.1-Codex** | Code analysis, debugging, refactoring | Medium |
| **Gemini-3.0-Pro** | Large context, document analysis | Fast |
| **Grok-4-fast-reasoning** | Quick reasoning tasks | Very Fast |
| **glm-4.6** | Multilingual tasks | Fast |
| **GPT-4o** | Vision, multimodal tasks | Medium |
| **Claude-3.5-Sonnet** | Legacy Claude tasks | Fast |

---

## Usage Examples

### Basic Analysis

```bash
# Natural language (in Claude Code, Cursor, etc.)
"Use Poe to analyze this codebase"
"Ask GPT-5.1-Codex to review my Python script"
"Compare Claude and GPT-5 on this architecture decision"
```

### With File References

```bash
# Analyze specific files
"Use Poe to analyze @src/main.ts and explain the architecture"
"Ask GPT-5.1-Codex to review @components/**/*.tsx"
"Use Gemini to summarize @docs/README.md"
```

### Brainstorming Tools

```bash
# SCAMPER Framework
"Brainstorm API improvements using SCAMPER methodology"

# Design Thinking
"Use design thinking to ideate new product features"

# Divergent Thinking
"Generate wild ideas for mobile app UX using divergent thinking"
```

### Auto-Routing Strategies

```bash
# Smart routing (automatic model selection)
"Analyze @src/**/*.ts with smart routing"
# Routes to GPT-5.1-Codex for code

# Mixed strategy (alternate models)
"Analyze this architecture decision with mixed strategy"
# Alternates Claude ↔ GPT-5 for diverse perspectives

# Round-robin (balanced usage)
"Quick question with round-robin"
# Cycles through all models
```

---

## MCP Tools Reference

These tools are designed to be used by AI assistants (not directly by users):

### `analyze-with-poe`
Main analysis tool with multi-model support.

**Parameters**:
- **`prompt`** (required): The analysis request
- **`model`** (optional): Specific model to use (defaults to Claude-Sonnet-4.5)
  - Options: `Claude-Sonnet-4.5`, `GPT-5.1`, `GPT-5.1-Codex`, `Gemini-3.0-Pro`, `Grok-4-fast-reasoning`, `glm-4.6`, `GPT-4o`, `Claude-3.5-Sonnet`
- **`files`** (optional): Array of file paths to include
- **`strategy`** (optional): Auto-routing strategy
  - `smart`: Routes based on task type (code → Codex, reasoning → GPT-5)
  - `mixed`: Alternates between models
  - `round-robin`: Cycles through all models
  - `fixed`: Uses specified model only (default)

**Examples**:
```json
{
  "prompt": "Explain this architecture",
  "model": "GPT-5.1-Codex",
  "files": ["src/main.ts", "src/utils/helper.ts"]
}
```

### `brainstorm-with-poe`
Structured brainstorming using proven methodologies.

**Parameters**:
- **`topic`** (required): What to brainstorm about
- **`methodology`** (optional): Framework to use
  - `scamper`: Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse
  - `design-thinking`: Empathize → Define → Ideate → Prototype → Test
  - `divergent`: Quantity over quality, wild ideas
  - `convergent`: Narrow down to best ideas
  - `lateral`: Provocative thinking, random input
  - `auto`: AI selects best methodology
- **`domain`** (optional): Context (e.g., "software", "product", "business")
- **`constraints`** (optional): Limitations or requirements
- **`model`** (optional): Model to use (defaults to Claude-Sonnet-4.5)

**Examples**:
```json
{
  "topic": "improve API performance",
  "methodology": "scamper",
  "domain": "software",
  "constraints": "must maintain backward compatibility"
}
```

### `ping`
Simple test tool to verify server connectivity.

**Parameters**:
- **`message`** (optional): Message to echo back

### `help`
Displays available commands and usage information.

---

## How It Works

### Direct API Integration

Unlike CLI-based approaches, poe-mcp-tool uses **direct HTTP calls** to the Poe API:

```typescript
// Direct REST API call (no subprocess overhead)
const response = await fetch("https://api.poe.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${POE_API_KEY}`
  },
  body: JSON.stringify({
    model: "Claude-Sonnet-4.5",
    messages: [{ role: "user", content: "your prompt" }]
  })
});
```

**Benefits**:
- ⚡ 2-5x faster than CLI spawning
- 🔒 Better error handling
- 📊 Structured JSON responses
- 🎯 Full model control

### Smart Auto-Routing

The `smart` strategy automatically selects the best model:

```typescript
// Code-related keywords → GPT-5.1-Codex
if (prompt.includes("function") || prompt.includes("class")) {
  model = "GPT-5.1-Codex";
}

// Reasoning keywords → GPT-5.1
else if (prompt.includes("why") || prompt.includes("analyze")) {
  model = "GPT-5.1";
}

// Default → Claude-Sonnet-4.5
else {
  model = "Claude-Sonnet-4.5";
}
```

---

## Comparison with poe-code

**poe-code** (Poe's official CLI) is excellent for configuring Claude Code to use Poe models with the `/model` command for **model switching**.

**poe-mcp-tool** provides **agentic delegation** - different value:

| Feature | poe-code | poe-mcp-tool |
|---------|----------|--------------|
| **Model Switching** | ✅ `/model` command | ❌ Not needed |
| **Cursor Support** | ❌ No (breaks due to bug) | ✅ **Bug workaround** |
| **Continue Support** | ⚠️ Chat only | ✅ **Tool use** |
| **Agentic Delegation** | ❌ No | ✅ **Main model calls specialized models as tools** |
| **Claude Code Value** | ✅ **Primary** (model switching) | ✅ **Complementary** (tool delegation) |

**Use both together for Claude Code**:
- **poe-code**: `/model gpt-5.1` switches your entire conversation to GPT-5
- **poe-mcp-tool**: Sonnet delegates large codebase analysis to Gemini 3.0 Pro tool, then synthesizes results

**For Cursor/Continue**: Use poe-mcp-tool only (poe-code doesn't support these clients)

---

## Migration from Gemini MCP Tool

If you're upgrading from the previous Gemini-based version:

**What Changed**:
- ✅ Gemini CLI → Poe API (8 models instead of 2)
- ✅ Added brainstorming methodologies
- ✅ Added auto-routing strategies
- ✅ 2-5x performance improvement
- ⚠️ Requires POE_API_KEY instead of Gemini CLI

**Migration Steps**:
1. Get Poe API key from [poe.com](https://poe.com)
2. Update config: `gemini-cli` → `poe`
3. Set `POE_API_KEY` environment variable
4. Update NPX package: `gemini-mcp-tool` → `poe-mcp-tool`

---

## Troubleshooting

### "POE_API_KEY not found"

Set your API key:
```bash
# Linux/macOS
export POE_API_KEY=your_key_here

# Windows
set POE_API_KEY=your_key_here
```

Or add to your MCP config's `env` section (see Configuration above).

### "Model not found"

Ensure you're using a valid model name:
- `Claude-Sonnet-4.5` (default)
- `GPT-5.1`
- `GPT-5.1-Codex`
- `Gemini-3.0-Pro`
- `Grok-4-fast-reasoning`
- `glm-4.6`
- `GPT-4o`
- `Claude-3.5-Sonnet`

### Server won't start

1. Verify Node.js version: `node --version` (should be v16+)
2. Clear NPX cache: `npx clear-npx-cache`
3. Try manual install: `npm install -g poe-mcp-tool`
4. Check logs in your MCP client's debug output

---

## Contributing

Contributions are welcome! The project uses a comprehensive Makefile to streamline development workflows.

### Quick Start for Contributors

```bash
# Clone and set up
git clone https://github.com/jamubc/poe-mcp-tool.git
cd poe-mcp-tool

# One-command development setup
make setup

# Install for local testing (optional)
make install-claude-code

# Start development
make dev
```

### Development Workflow

Use these Makefile commands for efficient development:

```bash
# During development
make dev          # Start with hot reload
make watch        # Watch for changes
make test         # Run tests
make lint         # Type checking
make format       # Format code (if prettier installed)

# Before committing
make pre-commit   # Run all checks

# Building and testing
make clean        # Clean artifacts
make build        # Production build
```

### Contributing Areas

**Areas for contribution**:
- Additional brainstorming methodologies
- Improved auto-routing heuristics
- Better error messages
- Documentation improvements
- New MCP client support
- Makefile enhancements and workflow improvements

### Release Process

The project uses a streamlined release workflow via Makefile:

```bash
# Full release (build + test + publish + tag)
make release

# Individual steps
make test lint    # Pre-release checks
make publish      # Publish to npm
```

All changes should pass `make pre-commit` before submission. Use `hug` for all git operations as per project guidelines.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

**Disclaimer**: This is an unofficial, third-party tool and is not affiliated with, endorsed, or sponsored by Poe or Quora.

---

## Roadmap

- [ ] Re-implement response chunking for large outputs
- [ ] Add usage analytics (token counts, costs per model)
- [ ] Multi-model comparison tool (query 3 models, compare)
- [ ] Cost tracking dashboard
- [ ] More brainstorming frameworks (Six Thinking Hats, TRIZ)
- [ ] Integration with poe-code (shared auth)

---

**Built with ❤️ for the MCP ecosystem**

For questions, issues, or feature requests, please [open an issue](https://github.com/jamubc/poe-mcp-tool/issues).
