# Changelog

## [2.0.0] - 2025-11-20

### Major Changes - Poe API Migration

**Breaking Changes**:
- Migrated from Gemini CLI to Poe API integration
- Renamed package from `gemini-mcp-tool` to `poe-mcp-tool`
- Changed authentication from Gemini CLI to `POE_API_KEY` environment variable
- Replaced `ask-gemini` tool with `analyze-with-poe`

**New Features**:
- 🤝 **Agentic Delegation**: Main LLM delegates tasks to specialized Poe models as tools
- 🐛 **Cursor Bug Workaround**: Stable Poe access without breaking native IDE features (fixes Global Override Bug)
- 🔧 **Continue Agentic Upgrade**: Hybrid local/cloud orchestration (local model → Poe tools)
- 🤖 **Claude Code Collaborative Intelligence**: Use with poe-code for tool delegation (Sonnet → Gemini for massive context)
- 🎯 **8 Premium Models**: Claude-Sonnet-4.5, GPT-5.1, GPT-5.1-Codex, Gemini-3.0-Pro, Grok-4-fast-reasoning, glm-4.6, GPT-4o, Claude-3.5-Sonnet
- 🧠 **Brainstorming Tools**: SCAMPER, Design Thinking, Divergent/Convergent, Lateral thinking frameworks
- 🔄 **Auto-Routing Strategies**: Smart (task-based), Mixed (alternating), Round-robin, Fixed
- ⚡ **Performance**: 2-5x faster (direct API vs CLI spawning)

**Architecture Improvements**:
- Direct REST API integration (no subprocess overhead)
- OpenAI-compatible API format
- Structured conversation management
- Model strategy system
- File reference parsing with `@file` syntax support

**Migration Guide**:
- Set `POE_API_KEY` environment variable
- Update config from `gemini-cli` to `poe`
- Update NPX package: `npx -y gemini-mcp-tool` → `npx -y poe-mcp-tool`
- See README.md for detailed migration instructions

### Files Added
- `src/utils/poeApiClient.ts` - Direct Poe API REST client
- `src/services/poeChatService.ts` - Conversation management with tool calling
- `src/utils/poeExecutor.ts` - High-level execution interface
- `src/tools/ask-poe.tool.ts` - Multi-model analysis tool
- `planning/migration-plan.md` - Detailed migration documentation
- `planning/MIGRATION_SUMMARY.md` - Migration metrics and results

### Files Removed
- `src/tools/ask-gemini.tool.ts` (replaced by ask-poe.tool.ts)
- `src/utils/geminiExecutor.ts` (replaced by poeExecutor.ts)
- `src/utils/commandExecutor.ts` (no longer needed)
- `src/utils/changeModeParser.ts` (Gemini-specific)
- `src/utils/changeModeTranslator.ts` (Gemini-specific)
- `src/utils/changeModeChunker.ts` (Gemini-specific)
- `src/utils/chunkCache.ts` (Gemini-specific)

### Known Issues
- Response chunking not yet implemented for Poe (was Gemini CLI-specific)
- Documentation in `docs/` still references Gemini (will be updated)

---

## [1.1.3] - Gemini Era

- "gemini reads, claude edits" workflow
- Added `changeMode` parameter to ask-gemini tool for structured edit responses using claude edit diff
- Intelligent parsing and chunking for large edit responses (>25k characters)
- Structured response format with Analysis, Suggested Changes, and Next Steps sections
- Improved guidance for applying edits using Claude's Edit/MultiEdit tools
- Token limit handling with continuation support for large responses

## [1.1.2]

- Gemini-2.5-pro quota limit exceeded now falls back to gemini-2.5-flash automatically
- Unless you ask for pro or flash, it will default to pro

## [1.1.1]

- Public release
- Basic Gemini CLI integration
- Support for file analysis with @ syntax
- Sandbox mode support
