# Migration Plan: Gemini-CLI MCP Server → Poe API Integration

**Project**: poe-mcp-tool
**Goal**: Replace Gemini CLI spawning with direct Poe API integration
**Complexity**: Medium-Low
**Timeline**: 3-4 days
**Strategy**: Direct Poe API Integration (NOT CLI spawning)

---

## 🎯 Strategic Decision: Direct Poe API Integration

### Why Direct API Instead of Spawning poe-code CLI?

| Aspect | Spawn poe-code CLI | Direct Poe API Integration |
|--------|-------------------|----------------------------|
| **Performance** | 🔴 Slow (process spawn overhead) | 🟢 Fast (direct HTTP calls) |
| **Control** | 🟡 Limited (CLI arguments) | 🟢 Full (programmatic) |
| **Model Selection** | 🟡 Basic CLI flags | 🟢 Advanced strategies built-in |
| **Streaming** | 🔴 Difficult via stdout | 🟢 Native support |
| **Error Handling** | 🔴 Parse stderr/exit codes | 🟢 Structured API errors |
| **Dependencies** | 🟡 Requires poe-code installed | 🟢 Just HTTP client |
| **Code Reuse** | 🔴 Minimal | 🟢 Can import poe-code modules |
| **Maintenance** | 🔴 CLI changes break integration | 🟢 Stable API contract |

**✅ Decision: Direct Poe API Integration**

---

## 📊 Available Models & Focus Areas

### Priority Models (User Specified)

1. **Claude-Sonnet-4.5** - Primary for file analysis & code explanations
2. **GPT-5.1** - Complex reasoning and analysis tasks
3. **GPT-5.1-Codex** - Code generation and completion
4. **glm-4.6** - Multilingual support and fallback
5. **Gemini-3.0-Pro** ⚠️ - Need to verify exact Poe API name
6. **Grok-4-fast-reasoning** ⚠️ - Need to verify exact Poe API name

### Model Mapping Strategy

| Poe Model | Strengths | Use Case in MCP | Current Gemini Equivalent |
|-----------|-----------|-----------------|---------------------------|
| **Claude-Sonnet-4.5** | Code analysis, instruction following | Primary for file analysis & explanations | gemini-2.5-pro |
| **GPT-5.1** | Reasoning, complex tasks | Alternative for complex queries | - |
| **GPT-5.1-Codex** | Code generation, completion | Code-focused operations | - |
| **glm-4.6** | Multilingual, general purpose | Fallback/diversity | gemini-2.5-flash |
| **Gemini-3.0-Pro** | Google's latest | Testing/comparison | gemini-2.5-pro |
| **Grok-4-fast-reasoning** | Fast reasoning | Quick analysis | - |

### ⚠️ Model Name Verification Required

The poe-code source code (`src/services/model-strategy.ts` lines 8-15) only shows 6 models:
- Claude-Sonnet-4.5
- GPT-5.1
- GPT-4o
- Claude-3.5-Sonnet
- GPT-5.1-Codex
- glm-4.6

**Action Required**: Verify availability and exact names for:
- Gemini-3.0-Pro (might be "Gemini-2.0-Flash-Exp" or similar)
- Grok-4-fast-reasoning (might be "Grok-2" or "grok-beta")

**Verification Method**:
```bash
poe-code query --model "Gemini-3.0-Pro" "test"
poe-code query --model "Grok-4-fast-reasoning" "test"
```

---

## 🏗️ Detailed Migration Architecture

### Phase 1: Core API Integration (Day 1)

#### 1.1 Extract/Adapt Poe API Client

**New Files to Create**:

```
src/utils/poeApiClient.ts
├─ Copy from: poe-code/src/cli/api-client.ts
├─ Exports: createPoeApiClient(), PoeApiClient interface
├─ Size: ~150 lines
└─ Dependencies: None (just fetch)

src/services/poeChatService.ts
├─ Copy from: poe-code/src/services/chat.ts
├─ Exports: PoeChatService class
├─ Size: ~390 lines
└─ Features: Conversation history, tool calling, streaming

src/services/modelStrategy.ts
├─ Copy from: poe-code/src/services/model-strategy.ts
├─ Exports: ModelStrategy classes, AVAILABLE_MODELS
├─ Size: ~250 lines
└─ Features: Smart, Mixed, Fixed, Round-Robin strategies
```

**Key Classes/Functions**:
```typescript
// From api-client.ts
interface PoeApiClient {
  verify(options: VerifyApiKeyOptions): Promise<void>;
  query(options: QueryOptions): Promise<string>;
}

// From chat.ts
class PoeChatService {
  constructor(apiKey: string, model: string, toolExecutor?, onToolCall?)
  async sendMessage(userMessage: string, tools?, options?): Promise<ChatMessage>
  setModel(model: string): void
  getModel(): string
  setStrategy(config: StrategyConfig): void
}

// From model-strategy.ts
const AVAILABLE_MODELS = [
  "Claude-Sonnet-4.5",
  "GPT-5.1",
  "GPT-4o",
  "Claude-3.5-Sonnet",
  "GPT-5.1-Codex",
  "glm-4.6",
];
```

#### 1.2 Create Poe Executor (Replaces geminiExecutor.ts)

**New File**: `src/utils/poeExecutor.ts`

```typescript
import { PoeChatService } from '../services/poeChatService.js';
import { Logger } from './logger.js';

export interface PoeExecutionOptions {
  prompt: string;
  model?: string;
  apiKey: string;
  files?: string[]; // For @file.js support
  onProgress?: (chunk: string) => void;
  strategy?: 'smart' | 'fixed' | 'mixed' | 'round-robin';
}

export async function executePoeAPI(
  options: PoeExecutionOptions
): Promise<string> {
  const {
    prompt,
    model = 'Claude-Sonnet-4.5',
    apiKey,
    files = [],
    onProgress,
    strategy
  } = options;

  // Handle file inclusion (Poe doesn't parse @file syntax)
  let enhancedPrompt = prompt;
  if (files.length > 0) {
    const fileContents = await readFiles(files);
    enhancedPrompt = `${prompt}\n\n# Referenced Files:\n${fileContents}`;
  }

  // Create chat service
  const chatService = new PoeChatService(
    apiKey,
    model,
    undefined, // toolExecutor
    undefined, // onToolCall
    undefined, // systemPrompt
    undefined  // taskRegistry
  );

  // Set strategy if specified
  if (strategy) {
    chatService.setStrategy({ type: strategy });
  }

  // Send message with streaming
  const response = await chatService.sendMessage(
    enhancedPrompt,
    undefined, // tools
    { onChunk: onProgress }
  );

  return response.content;
}

async function readFiles(filePaths: string[]): Promise<string> {
  // Implementation for reading files referenced with @
  // Similar to current geminiExecutor.ts file handling
}
```

**Changes from geminiExecutor.ts**:
- ❌ Remove: CLI spawning logic
- ❌ Remove: Sandbox flag handling
- ❌ Remove: Quota error detection
- ✅ Keep: File reading and @file syntax
- ✅ Keep: Progress callback pattern
- ✅ Add: Model strategy support
- ✅ Add: Streaming via onChunk

#### 1.3 Update Constants

**File**: `src/constants.ts`

```typescript
// OLD (Gemini):
export const GEMINI_PRO_MODEL = 'gemini-2.5-pro';
export const GEMINI_FLASH_MODEL = 'gemini-2.5-flash';

// NEW (Poe):
export const POE_MODELS = {
  // Primary models (verified in poe-code source)
  CLAUDE_SONNET: 'Claude-Sonnet-4.5',
  GPT_5: 'GPT-5.1',
  GPT_CODEX: 'GPT-5.1-Codex',
  GPT_4O: 'GPT-4o',
  GLM: 'glm-4.6',
  CLAUDE_35: 'Claude-3.5-Sonnet',

  // To be verified:
  GEMINI_PRO: 'Gemini-3.0-Pro', // ⚠️ Verify exact name
  GROK_REASONING: 'Grok-4-fast-reasoning', // ⚠️ Verify exact name
} as const;

export const DEFAULT_MODEL = POE_MODELS.CLAUDE_SONNET;
export const FALLBACK_MODEL = POE_MODELS.GLM; // Instead of flash

// Model categories for smart routing
export const MODEL_CATEGORIES = {
  CODE_ANALYSIS: [POE_MODELS.CLAUDE_SONNET, POE_MODELS.GPT_CODEX],
  REASONING: [POE_MODELS.GPT_5, POE_MODELS.GROK_REASONING],
  GENERAL: [POE_MODELS.GPT_4O, POE_MODELS.GLM],
  FALLBACK: [POE_MODELS.GLM, POE_MODELS.CLAUDE_35],
};

// API endpoint
export const POE_API_BASE_URL = 'https://api.poe.com/v1';
```

---

### Phase 2: Tool Migration (Day 2)

#### 2.1 Files That Need Changes

**Summary of Changes**:
| File | Change Type | Complexity | Details |
|------|-------------|------------|---------|
| `ask-gemini.tool.ts` | Major | Medium | Rename, replace executor, update models |
| `brainstorm.tool.ts` | **Minor** | **Low** | Only update executor call + model names |
| `fetch-chunk.tool.ts` | Minor | Low | Update model references |
| `simple-tools.ts` | None | None | No Gemini-specific logic |

#### 2.2 Detailed File Analysis

##### ✅ `brainstorm.tool.ts` - MINIMAL CHANGES NEEDED

**Current Assessment**: The file is **excellent** and well-structured. The brainstorming prompts, methodology frameworks, and logic are **model-agnostic** and work perfectly with any LLM.

**Required Changes** (4 small edits):

```typescript
// Line 4: Update import
- import { executeGeminiCLI } from '../utils/geminiExecutor.js';
+ import { executePoeAPI } from '../utils/poeExecutor.js';

// Line 120: Update model description
- model: z.string().optional().describe("Optional model to use (e.g., 'gemini-2.5-flash'). If not specified, uses the default model (gemini-2.5-pro)."),
+ model: z.string().optional().describe("Optional model to use (e.g., 'GPT-5.1-Codex', 'Claude-Sonnet-4.5'). If not specified, uses the default model."),

// Line 136: Update category
- category: 'gemini',
+ category: 'poe',

// Line 169: Update execution call
- return await executeGeminiCLI(enhancedPrompt, model as string | undefined, false, false, onProgress);
+ return await executePoeAPI({
+   prompt: enhancedPrompt,
+   model: model as string | undefined,
+   apiKey: process.env.POE_API_KEY!,
+   onProgress
+ });
```

**Why No Other Changes Needed**:
- ✅ Prompt engineering (lines 6-64): Model-agnostic, works with any LLM
- ✅ Methodology frameworks (lines 69-116): Universal brainstorming techniques
- ✅ Schema validation (lines 118-127): No Gemini-specific logic
- ✅ Logic flow (lines 138-170): Clean, reusable architecture

**Total Impact**: 4 lines changed, ~2 minutes of work

##### 🔧 `ask-gemini.tool.ts` - MODERATE CHANGES

**Rename to**: `ask-poe.tool.ts`

**Changes Required**:
```typescript
// Update imports
- import { executeGeminiCLI } from '../utils/geminiExecutor.js';
+ import { executePoeAPI } from '../utils/poeExecutor.js';

// Update schema
const askPoeArgsSchema = z.object({
  prompt: z.string(),
- model: z.enum(['gemini-2.5-pro', 'gemini-2.5-flash']).optional(),
+ model: z.enum([
+   'Claude-Sonnet-4.5',
+   'GPT-5.1',
+   'GPT-5.1-Codex',
+   'glm-4.6',
+   // Add verified models
+ ]).optional(),
  files: z.array(z.string()).optional(),
  chunkIndex: z.number().optional(),
  chunkCacheKey: z.string().optional(),
});

// Update tool definition
export const askPoeTool: UnifiedTool = {
- name: "analyze",
+ name: "analyze-with-poe",
- description: "Analyze files using Gemini...",
+ description: "Analyze files using Poe models (Claude, GPT-5, Codex, etc.)...",
- category: 'gemini',
+ category: 'poe',

  execute: async (args, onProgress) => {
    // Remove Gemini quota handling logic
-   try {
-     return await executeGeminiCLI(...);
-   } catch (error) {
-     if (error.message.includes('RESOURCE_EXHAUSTED')) {
-       return await executeGeminiCLI(..., 'gemini-2.5-flash');
-     }
-   }

    // Replace with Poe execution
+   return await executePoeAPI({
+     prompt: args.prompt,
+     model: args.model,
+     apiKey: process.env.POE_API_KEY!,
+     files: args.files,
+     onProgress
+   });
  }
};
```

**Removed Logic**:
- ❌ Quota error handling (Poe manages this server-side)
- ❌ Sandbox flag (no equivalent in Poe)
- ❌ CLI-specific error parsing

**Kept Logic**:
- ✅ Chunking support (works with any API)
- ✅ File inclusion (@file syntax)
- ✅ Progress callbacks

##### 📦 `fetch-chunk.tool.ts` - MINIMAL CHANGES

**Changes**: Only update model references in descriptions
- No execution logic changes (uses cache, not API directly)

#### 2.3 Response Processing Updates

**Files to Modify/Remove**:

```
src/utils/
├─ geminiExecutor.ts → DELETE (replaced by poeExecutor.ts)
├─ changeModeParser.ts → DELETE (Gemini-specific git diff parsing)
├─ changeModeTranslator.ts → DELETE (Gemini-specific)
├─ changeModeChunker.ts → KEEP (generic chunking logic)
├─ chunkCache.ts → KEEP (works with any API)
├─ timeoutManager.ts → KEEP (generic timeout handling)
└─ commandExecutor.ts → DELETE (CLI spawning, not needed)
```

**Why Delete Change Mode Files**:
- Gemini CLI returns code changes in git diff format
- Poe API returns standard text/markdown
- No need for specialized parsing

**Rename Suggestion**:
- `changeModeChunker.ts` → `responseChunker.ts` (more generic name)

---

### Phase 3: MCP Server Integration (Day 2-3)

#### 3.1 Update MCP Tool Registry

**File**: `src/tools/registry.ts`

```typescript
import { askPoeTool } from './ask-poe.tool.js';
import { brainstormTool } from './brainstorm.tool.js';
import { fetchChunkTool } from './fetch-chunk.tool.js';
import { pingTool, helpTool } from './simple-tools.js';

export const toolRegistry: UnifiedTool[] = [
  askPoeTool,      // Renamed from askGeminiTool
  brainstormTool,  // Updated to use Poe
  fetchChunkTool,
  pingTool,
  helpTool,
];

// Tool definitions for MCP
export function getToolDefinitions(): Tool[] {
  return toolRegistry.map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: zodToJsonSchema(tool.zodSchema),
  }));
}
```

**Changes**:
- Update import path: `ask-gemini.tool.js` → `ask-poe.tool.js`
- Update references throughout file

#### 3.2 Authentication & Configuration

**File**: `src/index.ts` (main MCP server entry)

```typescript
// OLD (Gemini):
// Relied on gemini CLI being configured via ~/.gemini/

// NEW (Poe):
function getApiKey(): string {
  // Priority order:
  // 1. Environment variable
  if (process.env.POE_API_KEY) {
    return process.env.POE_API_KEY;
  }

  // 2. Config file (poe-code format)
  const configPath = path.join(os.homedir(), '.poe-code', 'credentials.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (config.apiKey) {
      return config.apiKey;
    }
  }

  // 3. Error if not found
  throw new Error(
    'POE_API_KEY not found. Set via:\n' +
    '  export POE_API_KEY=your-key\n' +
    '  OR run: poe-code login'
  );
}

// Migration helper
function checkLegacyGeminiConfig(): void {
  if (process.env.GEMINI_API_KEY && !process.env.POE_API_KEY) {
    Logger.warn('⚠️ Found GEMINI_API_KEY. Please set POE_API_KEY instead.');
    Logger.warn('   Get your key at: https://poe.com/settings');
  }
}
```

#### 3.3 Progress Tracking with Streaming

**File**: `src/index.ts` - Update progress notification system

```typescript
// OLD (Gemini): 25-second keepalive intervals
const KEEPALIVE_INTERVAL = 25_000;
const statusMessages = [
  '🧠 Analyzing...',
  '📊 Processing files...',
  // ...
];

// NEW (Poe): Use streaming instead
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  let progressToken = request.params._meta?.progressToken;
  let latestOutput = '';

  const onProgress = progressToken
    ? (chunk: string) => {
        latestOutput += chunk;
        // Send progress notification with actual content
        server.notification({
          method: "notifications/progress",
          params: {
            progressToken,
            progress: latestOutput.length,
            total: undefined,
          }
        });
      }
    : undefined;

  const result = await executeTool(name, args, onProgress);

  // Send final notification
  if (progressToken) {
    server.notification({
      method: "notifications/complete",
      params: {
        progressToken,
        status: "success"
      }
    });
  }

  return result;
});
```

**Changes**:
- ❌ Remove: Artificial 25s keepalive (not needed with streaming)
- ✅ Add: Real-time chunk updates from Poe API
- ✅ Keep: Progress token system (MCP protocol)

---

### Phase 4: Configuration & Documentation (Day 3)

#### 4.1 Package Updates

**File**: `package.json`

```json
{
  "name": "poe-mcp-tool",
  "version": "2.0.0",
  "description": "MCP server for Poe API (Claude, GPT-5, Codex, etc.)",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "poe-mcp-tool": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "zod": "^3.25.76",
    "zod-to-json-schema": "^3.24.6",
    "chalk": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.7",
    "typescript": "^5.4.5",
    "tsx": "^4.7.1"
  },
  "keywords": [
    "mcp",
    "poe",
    "claude",
    "gpt-5",
    "codex",
    "ai",
    "llm"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/[username]/poe-mcp-tool"
  }
}
```

**Changes**:
- Name: `gemini-mcp-tool` → `poe-mcp-tool`
- Version: Bump to `2.0.0` (major change)
- Description: Update to reflect Poe models
- Keywords: Add poe, claude, gpt-5, codex
- **No need to add poe-code dependency** (we copy the needed files)

#### 4.2 Documentation Updates

**File**: `README.md`

**New Content Structure**:

```markdown
# poe-mcp-tool

> MCP server for Poe API - Access Claude, GPT-5, Codex, and more via Model Context Protocol

## Features

- 🤖 **Multiple Models**: Claude-Sonnet-4.5, GPT-5.1, GPT-5.1-Codex, glm-4.6, and more
- 🎯 **Smart Model Selection**: Automatic model routing based on task type
- 📊 **Code Analysis**: Analyze large codebases with 1M+ token context
- 🧠 **Brainstorming**: Structured ideation with SCAMPER, Design Thinking, etc.
- 🔄 **Streaming**: Real-time responses via MCP progress notifications

## Quick Start

### 1. Get Poe API Key

Visit https://poe.com/settings and create an API key.

### 2. Install & Configure

```bash
# Install globally
npm install -g poe-mcp-tool

# Set API key
export POE_API_KEY=your-key-here

# Or use poe-code login
npx poe-code login
```

### 3. Add to Claude Code (or other MCP client)

```bash
claude mcp add poe -- npx -y poe-mcp-tool
```

### 4. Test It

In Claude Code:
```
/poe:analyze @main.ts explain this code
/poe:brainstorm ideas for improving performance
```

## Available Models

| Model | Best For | Token Limit |
|-------|----------|-------------|
| Claude-Sonnet-4.5 | Code analysis, explanations | 200K |
| GPT-5.1 | Complex reasoning, planning | 128K |
| GPT-5.1-Codex | Code generation, completion | 128K |
| glm-4.6 | Multilingual, general purpose | 128K |

## Configuration

### Environment Variables

- `POE_API_KEY` - Your Poe API key (required)

### Model Selection Strategies

```bash
# Smart: Auto-selects based on task type (default)
# Uses GPT-5.1 for complex reasoning, Claude for code, etc.

# Fixed: Always use same model
POE_STRATEGY=fixed POE_MODEL=Claude-Sonnet-4.5

# Mixed: Alternate between GPT-5.1 and Claude
POE_STRATEGY=mixed

# Round-robin: Cycle through all models
POE_STRATEGY=round-robin
```

## Tools

### analyze-with-poe
Analyze files using Poe models.

**Arguments**:
- `prompt` (required): Question or task
- `model` (optional): Specific model to use
- `files` (optional): Files to analyze (supports @file.js syntax)

**Example**:
```
/poe:analyze @src/**/*.ts find all TODO comments
```

### brainstorm
Generate ideas using structured methodologies.

**Arguments**:
- `prompt` (required): Challenge or question
- `methodology` (optional): divergent, scamper, design-thinking, etc.
- `domain` (optional): software, business, creative, etc.
- `ideaCount` (optional): Number of ideas (default: 12)

**Example**:
```
/poe:brainstorm how to reduce API latency --methodology scamper --domain software
```

## Migration from gemini-mcp-tool

If you're migrating from the Gemini version:

1. Uninstall old version: `npm uninstall -g gemini-mcp-tool`
2. Update MCP config: Replace `gemini-mcp-tool` with `poe-mcp-tool`
3. Update API key: Set `POE_API_KEY` instead of configuring Gemini CLI
4. Update tool names: `/gemini:analyze` → `/poe:analyze`

## Troubleshooting

### "POE_API_KEY not found"
Set your API key:
```bash
export POE_API_KEY=your-key
```

Or use poe-code:
```bash
npx poe-code login
```

### "Model not available"
Check available models at https://poe.com/models

Some models require Poe subscription:
- GPT-5.1 (requires Poe Pro)
- Claude-Sonnet-4.5 (free tier)

## License

MIT
```

#### 4.3 Migration Guide

**New File**: `docs/MIGRATION.md`

```markdown
# Migration Guide: Gemini → Poe

This guide helps you migrate from `gemini-mcp-tool` to `poe-mcp-tool`.

## Why Migrate?

- ✅ Access to more models (Claude, GPT-5, Codex, etc.)
- ✅ Better API with streaming support
- ✅ Smart model selection strategies
- ✅ No CLI dependency (faster startup)
- ✅ Tool calling support for agentic workflows

## Step-by-Step Migration

### 1. Get Poe API Key

1. Visit https://poe.com/settings
2. Click "API Keys"
3. Create new key
4. Copy the key (starts with `sk-...`)

### 2. Update Environment

```bash
# Remove Gemini config (optional)
rm -rf ~/.gemini/

# Set Poe API key
echo 'export POE_API_KEY=sk-...' >> ~/.bashrc
source ~/.bashrc

# Or use poe-code
npx poe-code login
```

### 3. Update MCP Configuration

**Claude Code**:
```bash
# Remove old
claude mcp remove gemini

# Add new
claude mcp add poe -- npx -y poe-mcp-tool
```

**Cursor/Other**:
Update MCP config file (`~/.cursor/mcp_config.json` or similar):

```json
{
  "mcpServers": {
    "poe": {
      "command": "npx",
      "args": ["-y", "poe-mcp-tool"],
      "env": {
        "POE_API_KEY": "your-key-here"
      }
    }
  }
}
```

### 4. Update Tool Usage

**Old (Gemini)**:
```
/gemini:analyze @file.ts explain this
/gemini:brainstorm ideas for feature
```

**New (Poe)**:
```
/poe:analyze @file.ts explain this
/poe:brainstorm ideas for feature
```

### 5. Model Selection

**Old**: Limited to `gemini-2.5-pro` and `gemini-2.5-flash`

**New**: Choose from multiple models:
```
/poe:analyze @code.ts --model Claude-Sonnet-4.5
/poe:analyze @code.ts --model GPT-5.1-Codex
```

Or use smart strategy (auto-selects best model):
```
export POE_STRATEGY=smart
/poe:analyze @complex.ts explain the algorithm
# Uses GPT-5.1 for complex reasoning

/poe:analyze @simple.ts what does this do
# Uses Claude for straightforward code analysis
```

## Model Comparison

| Gemini Model | Poe Equivalent | Notes |
|--------------|----------------|-------|
| gemini-2.5-pro | Claude-Sonnet-4.5 | Similar performance, better code analysis |
| gemini-2.5-flash | glm-4.6 | Faster, multilingual |
| N/A | GPT-5.1 | Better reasoning |
| N/A | GPT-5.1-Codex | Specialized for code |

## Troubleshooting

### "POE_API_KEY not found"
Make sure you've set the environment variable or used `poe-code login`.

### "Tool not found"
Restart your MCP client after updating configuration.

### "Model not available"
Some models require Poe Pro subscription. Check https://poe.com/pricing

## Rollback

If you need to rollback:

```bash
# Reinstall Gemini version
npm install -g gemini-mcp-tool

# Update MCP config back to gemini
claude mcp add gemini -- npx -y gemini-mcp-tool
```

## Questions?

Open an issue at: https://github.com/[username]/poe-mcp-tool/issues
```

---

### Phase 5: Testing & Validation (Day 4)

#### 5.1 Model Name Verification

**Script to Test Model Availability**:

Create `scripts/verify-models.sh`:

```bash
#!/bin/bash

# Models to verify
MODELS=(
  "Claude-Sonnet-4.5"
  "GPT-5.1"
  "GPT-5.1-Codex"
  "glm-4.6"
  "Gemini-3.0-Pro"
  "Grok-4-fast-reasoning"
  "Claude-3.5-Sonnet"
  "GPT-4o"
)

echo "Testing Poe model availability..."
echo "=================================="

for model in "${MODELS[@]}"; do
  echo -n "Testing $model... "

  result=$(poe-code query --model "$model" "test" 2>&1)

  if [[ $result == *"error"* ]] || [[ $result == *"not found"* ]]; then
    echo "❌ NOT AVAILABLE"
  else
    echo "✅ AVAILABLE"
  fi
done

echo ""
echo "Update constants.ts with verified model names."
```

**Run**:
```bash
chmod +x scripts/verify-models.sh
./scripts/verify-models.sh
```

#### 5.2 Integration Tests

**Test Cases**:

1. **Basic Query**:
```bash
# Test simple analysis
/poe:analyze "What is 2+2?"
```

2. **File Analysis**:
```bash
# Test file reading
/poe:analyze @package.json explain the dependencies
```

3. **Model Selection**:
```bash
# Test explicit model
/poe:analyze "Complex algorithm question" --model GPT-5.1
```

4. **Brainstorming**:
```bash
# Test brainstorm tool
/poe:brainstorm "improve API performance" --methodology scamper
```

5. **Streaming**:
```bash
# Verify progress updates appear in real-time
/poe:analyze @large-file.ts explain this code
```

#### 5.3 Performance Comparison

**Benchmark Script**: `scripts/benchmark.ts`

```typescript
// Compare Gemini CLI vs Poe API performance
const prompt = "Explain this code...";

// Old way (Gemini CLI)
const geminiStart = Date.now();
await executeGeminiCLI(prompt);
const geminiTime = Date.now() - geminiStart;

// New way (Poe API)
const poeStart = Date.now();
await executePoeAPI({ prompt, apiKey: '...' });
const poeTime = Date.now() - poeStart;

console.log(`Gemini CLI: ${geminiTime}ms`);
console.log(`Poe API: ${poeTime}ms`);
console.log(`Speedup: ${(geminiTime / poeTime).toFixed(2)}x`);
```

**Expected Results**:
- Poe API should be 2-5x faster (no CLI spawn overhead)
- Streaming should provide earlier feedback

---

## 📝 Complete File Change Summary

### Files to Create (9 files)

1. `src/utils/poeApiClient.ts` - Copy from poe-code
2. `src/services/poeChatService.ts` - Copy from poe-code
3. `src/services/modelStrategy.ts` - Copy from poe-code
4. `src/utils/poeExecutor.ts` - New (replaces geminiExecutor)
5. `docs/MIGRATION.md` - New migration guide
6. `scripts/verify-models.sh` - Model verification script
7. `scripts/benchmark.ts` - Performance testing
8. `planning/migration-plan.md` - This document
9. `src/tools/ask-poe.tool.ts` - Renamed from ask-gemini

### Files to Modify (6 files)

1. `src/tools/brainstorm.tool.ts` - 4 line changes
2. `src/tools/fetch-chunk.tool.ts` - Update model references
3. `src/tools/registry.ts` - Update imports
4. `src/constants.ts` - Replace Gemini with Poe constants
5. `src/index.ts` - Update auth and progress handling
6. `package.json` - Rename and update metadata

### Files to Delete (4 files)

1. `src/utils/geminiExecutor.ts` - Replaced by poeExecutor
2. `src/utils/changeModeParser.ts` - Gemini-specific
3. `src/utils/changeModeTranslator.ts` - Gemini-specific
4. `src/utils/commandExecutor.ts` - CLI spawning, not needed

### Files to Rename (1 file)

1. `src/utils/changeModeChunker.ts` → `src/utils/responseChunker.ts`

### Documentation Files to Update (2 files)

1. `README.md` - Complete rewrite for Poe
2. `docs/` - Update all Gemini references

---

## ⚠️ Critical Action Items

### Before Starting Implementation

1. ✅ **Verify Model Names**: Run `poe-code query` tests for:
   - Gemini-3.0-Pro
   - Grok-4-fast-reasoning

2. ✅ **Get Poe API Key**: Set up `POE_API_KEY` for testing

3. ✅ **Backup Current Code**: Create git branch
   ```bash
   git checkout -b feature/poe-migration
   ```

### During Implementation

1. ✅ **Test Each Phase**: Don't move to next phase until current is working
2. ✅ **Keep Git History Clean**: Commit after each phase
3. ✅ **Update Tests**: Add tests for new Poe integration

### After Implementation

1. ✅ **Performance Test**: Benchmark vs old Gemini version
2. ✅ **Documentation Review**: Ensure all examples work
3. ✅ **Publish**: Update npm package

---

## 📊 Implementation Checklist

### Phase 1: Core API (Day 1)
- [ ] Copy `poeApiClient.ts` from poe-code
- [ ] Copy `poeChatService.ts` from poe-code
- [ ] Copy `modelStrategy.ts` from poe-code
- [ ] Create `poeExecutor.ts`
- [ ] Update `constants.ts` with Poe models
- [ ] Test basic API calls

### Phase 2: Tools (Day 2)
- [ ] Update `brainstorm.tool.ts` (4 lines)
- [ ] Rename & update `ask-gemini.tool.ts` → `ask-poe.tool.ts`
- [ ] Update `fetch-chunk.tool.ts`
- [ ] Update `registry.ts` imports
- [ ] Delete unused files (changeModeParser, etc.)
- [ ] Test all tools

### Phase 3: MCP Server (Day 2-3)
- [ ] Update `index.ts` authentication
- [ ] Update progress/streaming logic
- [ ] Test MCP integration with Claude Code
- [ ] Verify tool discovery

### Phase 4: Docs (Day 3)
- [ ] Update `package.json`
- [ ] Rewrite `README.md`
- [ ] Create `MIGRATION.md`
- [ ] Update all docs references
- [ ] Test installation flow

### Phase 5: Testing (Day 4)
- [ ] Run model verification script
- [ ] Integration tests (all tools)
- [ ] Performance benchmarks
- [ ] User acceptance testing
- [ ] Fix any issues found

### Phase 6: Release
- [ ] Version bump to 2.0.0
- [ ] Create GitHub release
- [ ] Publish to npm
- [ ] Announce migration

---

## 🎯 Success Metrics

### Performance
- ✅ Startup time: < 1s (vs 2-3s with CLI)
- ✅ Response time: 2-5x faster than Gemini CLI
- ✅ Streaming: Real-time chunks vs batch updates

### Functionality
- ✅ All 6+ models accessible
- ✅ Smart model routing works
- ✅ Tool calling support
- ✅ File analysis preserved
- ✅ Brainstorming quality maintained

### Developer Experience
- ✅ Easy installation (1 command)
- ✅ Clear documentation
- ✅ Smooth migration path
- ✅ Better error messages

---

## 🔮 Future Enhancements

### Post-Migration Features

1. **Multi-Model Brainstorming**:
   - Query multiple models in parallel
   - Aggregate and dedupe ideas
   - Show which model contributed what

2. **Cost Optimization**:
   - Track token usage per model
   - Route simple queries to cheaper models
   - Provide usage reports

3. **Advanced Strategies**:
   - Load-balancing across models
   - A/B testing different models
   - User-defined routing rules

4. **Tool Calling**:
   - Let models call other MCP tools
   - Build agentic workflows
   - Multi-step reasoning

5. **Caching**:
   - Cache expensive operations
   - Semantic deduplication
   - Shared context across queries

---

## 📚 Resources

### Documentation
- [Poe API Docs](https://poe.com/api)
- [MCP Protocol Spec](https://modelcontextprotocol.io)
- [poe-code GitHub](https://github.com/poe-platform/poe-code)

### Testing
- [Model Comparison](https://poe.com/models)
- [API Key Management](https://poe.com/settings)

### Community
- GitHub Issues: Report bugs
- Discussions: Feature requests
- Discord: Real-time help

---

**Last Updated**: 2025-11-20
**Status**: Ready for Implementation
**Estimated Completion**: 3-4 days
