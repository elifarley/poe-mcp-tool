/**
 * Poe Executor
 * High-level interface for executing prompts via Poe API
 * Replaces geminiExecutor.ts with direct API integration
 */

import { PoeChatService } from '../services/poeChatService.js';
import { Logger } from './logger.js';
import fs from 'fs/promises';
import path from 'path';

export interface PoeExecutionOptions {
  prompt: string;
  model?: string;
  apiKey: string;
  files?: string[];
  onProgress?: (chunk: string) => void;
  strategy?: 'smart' | 'fixed' | 'mixed' | 'round-robin';
}

/**
 * Execute a prompt using Poe API
 * Supports file inclusion, progress callbacks, and model strategy
 */
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

  Logger.debug(`[PoeExecutor] Executing with model: ${model}`);

  // Handle file inclusion (@file.js syntax support)
  let enhancedPrompt = prompt;
  if (files.length > 0) {
    try {
      const fileContents = await readReferencedFiles(files);
      enhancedPrompt = `${prompt}\n\n# Referenced Files:\n${fileContents}`;
      Logger.debug(`[PoeExecutor] Included ${files.length} file(s)`);
    } catch (error) {
      Logger.error(`[PoeExecutor] Failed to read files: ${error}`);
      throw error;
    }
  }

  // Create chat service
  const chatService = new PoeChatService(
    apiKey,
    model,
    undefined, // toolExecutor - not used in MCP context
    undefined, // onToolCall - not used in MCP context
    undefined  // systemPrompt - could be added later
  );

  // Set strategy if specified
  if (strategy) {
    chatService.setStrategy({ type: strategy });
    Logger.debug(`[PoeExecutor] Using strategy: ${strategy}`);
  }

  // Send message with streaming support
  try {
    const response = await chatService.sendMessage(
      enhancedPrompt,
      undefined, // tools - not used in MCP context
      { onChunk: onProgress }
    );

    Logger.debug(`[PoeExecutor] Received response (${response.content.length} chars)`);
    return response.content;
  } catch (error) {
    Logger.error(`[PoeExecutor] API call failed: ${error}`);
    throw new Error(`Poe API execution failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Read files referenced in the prompt
 * Supports both absolute paths and @file syntax
 */
async function readReferencedFiles(filePaths: string[]): Promise<string> {
  const fileContents: string[] = [];

  for (const filePath of filePaths) {
    try {
      // Remove @ prefix if present
      const cleanPath = filePath.startsWith('@') ? filePath.slice(1) : filePath;

      // Resolve path (handle relative paths)
      const resolvedPath = path.isAbsolute(cleanPath)
        ? cleanPath
        : path.resolve(process.cwd(), cleanPath);

      const content = await fs.readFile(resolvedPath, 'utf-8');
      const fileName = path.basename(resolvedPath);

      fileContents.push(
        `## ${fileName}\n` +
        `Path: ${resolvedPath}\n` +
        `\`\`\`\n${content}\n\`\`\``
      );

      Logger.debug(`[PoeExecutor] Read file: ${resolvedPath} (${content.length} chars)`);
    } catch (error) {
      const errorMsg = `Failed to read file '${filePath}': ${error instanceof Error ? error.message : String(error)}`;
      Logger.warn(`[PoeExecutor] ${errorMsg}`);
      fileContents.push(`## ${filePath}\n**Error**: ${errorMsg}`);
    }
  }

  return fileContents.join('\n\n---\n\n');
}

/**
 * Get API key from environment or config
 */
export function getApiKey(): string {
  // Priority 1: Environment variable
  if (process.env.POE_API_KEY) {
    return process.env.POE_API_KEY;
  }

  // Priority 2: Config file (poe-code format)
  try {
    const configPath = path.join(process.env.HOME || '', '.poe-code', 'credentials.json');
    const configContent = require('fs').readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    if (config.apiKey) {
      return config.apiKey;
    }
  } catch (error) {
    // Config file doesn't exist or is invalid - that's ok
  }

  // No API key found
  throw new Error(
    'POE_API_KEY not found. Set via:\n' +
    '  export POE_API_KEY=your-key\n' +
    '  OR run: npx poe-code login\n' +
    '  Get your key at: https://poe.com/settings'
  );
}

/**
 * Validate API key by making a test call
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const chatService = new PoeChatService(apiKey, 'Claude-Sonnet-4.5');
    await chatService.sendMessage('ping');
    return true;
  } catch (error) {
    Logger.error(`[PoeExecutor] API key validation failed: ${error}`);
    return false;
  }
}
