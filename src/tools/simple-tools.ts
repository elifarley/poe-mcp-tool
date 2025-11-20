import { z } from 'zod';
import { UnifiedTool } from './registry.js';

const pingArgsSchema = z.object({
  prompt: z.string().default('').describe("Message to echo "),
});

export const pingTool: UnifiedTool = {
  name: "ping",
  description: "Echo",
  zodSchema: pingArgsSchema,
  prompt: {
    description: "Echo test message with structured response.",
  },
  category: 'simple',
  execute: async (args, onProgress) => {
    const message = args.prompt || args.message || "Pong!";
    return `Poe MCP Tool v2.0.0 - ${message}`;
  }
};

const helpArgsSchema = z.object({});

export const helpTool: UnifiedTool = {
  name: "Help",
  description: "receive help information",
  zodSchema: helpArgsSchema,
  prompt: {
    description: "receive help information",
  },
  category: 'simple',
  execute: async (args, onProgress) => {
    return `Poe MCP Tool v2.0.0

Available tools:
- analyze-with-poe: Analyze code and files using Poe AI models
- brainstorm: Generate ideas using structured methodologies
- ping: Test connection
- help: Show this message

Available models:
- Claude-Sonnet-4.5 (default)
- GPT-5.1
- GPT-5.1-Codex
- Gemini-3.0-Pro
- Grok-4-fast-reasoning
- glm-4.6

For more information, visit: https://github.com/jamubc/poe-mcp-tool`;
  }
};