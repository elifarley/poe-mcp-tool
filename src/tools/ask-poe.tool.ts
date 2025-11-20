import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { executePoeAPI, getApiKey } from '../utils/poeExecutor.js';
import { POE_MODELS, ERROR_MESSAGES, STATUS_MESSAGES } from '../constants.js';

const askPoeArgsSchema = z.object({
  prompt: z.string().min(1).describe("Analysis request. Use @ syntax to include files (e.g., '@largefile.js explain what this does') or ask general questions"),
  model: z.enum([
    POE_MODELS.CLAUDE_SONNET,
    POE_MODELS.GPT_5,
    POE_MODELS.GPT_CODEX,
    POE_MODELS.GPT_4O,
    POE_MODELS.GLM,
    POE_MODELS.CLAUDE_35,
    POE_MODELS.GEMINI_PRO,
    POE_MODELS.GROK_REASONING,
  ] as const).optional().describe("Optional model to use. If not specified, uses Claude-Sonnet-4.5."),
  files: z.array(z.string()).optional().describe("Files to include in the analysis (alternative to @ syntax)"),
  strategy: z.enum(['smart', 'fixed', 'mixed', 'round-robin'] as const).optional().describe("Model selection strategy: 'smart' (auto-select based on task), 'fixed' (single model), 'mixed' (alternate), 'round-robin' (cycle through all)"),
  chunkIndex: z.union([z.number(), z.string()]).optional().describe("Which chunk to return (1-based)"),
  chunkCacheKey: z.string().optional().describe("Optional cache key for continuation"),
});

export const askPoeTool: UnifiedTool = {
  name: "analyze-with-poe",
  description: "Analyze code and files using Poe AI models (Claude-Sonnet-4.5, GPT-5.1, GPT-5.1-Codex, Gemini-3.0-Pro, Grok-4-fast-reasoning, etc.). Supports file inclusion via @ syntax, multi-model strategies, and large codebase analysis.",
  zodSchema: askPoeArgsSchema,
  prompt: {
    description: "Analyze code, explain functionality, review architecture, or answer questions using Poe's advanced AI models with smart model selection.",
  },
  category: 'poe',
  execute: async (args, onProgress) => {
    const { prompt, model, files, strategy, chunkIndex, chunkCacheKey } = args;

    if (!prompt?.trim()) {
      throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
    }

    // Handle chunked responses (continuation from previous request)
    if (chunkIndex && chunkCacheKey) {
      // TODO: Implement chunk caching for large responses
      return "Chunked responses not yet implemented for Poe API";
    }

    // Get API key
    const apiKey = getApiKey();

    // Parse @file syntax from prompt
    const fileReferences = parseFileReferences(prompt as string);
    const filesArray = Array.isArray(files) ? files : (files ? [files as string] : []);
    const allFiles = [
      ...filesArray,
      ...fileReferences
    ];

    // Execute via Poe API
    const result = await executePoeAPI({
      prompt: prompt as string,
      model: model as string | undefined,
      apiKey,
      files: allFiles.length > 0 ? allFiles : undefined,
      onProgress,
      strategy: strategy as 'smart' | 'fixed' | 'mixed' | 'round-robin' | undefined
    });

    // Check if response needs chunking
    if (result.length > 100000) { // 100k chars threshold
      // TODO: Implement response chunking for large outputs
      return `${STATUS_MESSAGES.POE_RESPONSE}\n[Large response truncated at 100k chars]\n${result.slice(0, 100000)}...`;
    }

    return `${STATUS_MESSAGES.POE_RESPONSE}\n${result}`;
  }
};

/**
 * Parse @file references from prompt text
 * Example: "@src/index.ts explain this" → ["src/index.ts"]
 */
function parseFileReferences(prompt: string): string[] {
  const filePattern = /@([^\s]+)/g;
  const matches = prompt.matchAll(filePattern);
  return Array.from(matches, m => m[1]);
}
