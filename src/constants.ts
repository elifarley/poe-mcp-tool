

// Logging
export const LOG_PREFIX = "[POE-MCP]";

// Error messages
export const ERROR_MESSAGES = {
  TOOL_NOT_FOUND: "not found in registry",
  NO_PROMPT_PROVIDED: "Please provide a prompt for analysis. Use @ syntax to include files (e.g., '@largefile.js explain what this does') or ask general questions",
  API_KEY_NOT_FOUND: "POE_API_KEY not found. Set via: export POE_API_KEY=your-key OR run: npx poe-code login",
} as const;

// Status messages
export const STATUS_MESSAGES = {
  POE_RESPONSE: "Poe response:",
  // Timeout prevention messages
  PROCESSING_START: "🔍 Starting analysis (may take 5-15 minutes for large codebases)",
  PROCESSING_CONTINUE: "⏳ Still processing... Poe is working on your request",
  PROCESSING_COMPLETE: "✅ Analysis completed successfully",
} as const;

// Poe Models
export const POE_MODELS = {
  // Primary models (verified and available)
  CLAUDE_SONNET: "Claude-Sonnet-4.5",
  GPT_5: "GPT-5.1",
  GPT_CODEX: "GPT-5.1-Codex",
  GPT_4O: "GPT-4o",
  GLM: "glm-4.6",
  CLAUDE_35: "Claude-3.5-Sonnet",

  // Extended models (user-requested, verified)
  GEMINI_PRO: "Gemini-3.0-Pro",
  GROK_REASONING: "Grok-4-fast-reasoning",
} as const;

// Model categories for smart routing
export const MODEL_CATEGORIES = {
  CODE_ANALYSIS: [POE_MODELS.CLAUDE_SONNET, POE_MODELS.GPT_CODEX] as const,
  REASONING: [POE_MODELS.GPT_5, POE_MODELS.GROK_REASONING] as const,
  GENERAL: [POE_MODELS.GPT_4O, POE_MODELS.GLM] as const,
  FALLBACK: [POE_MODELS.GLM, POE_MODELS.CLAUDE_35] as const,
} as const;

// Default model selection
export const DEFAULT_MODEL = POE_MODELS.CLAUDE_SONNET;
export const FALLBACK_MODEL = POE_MODELS.GLM;

// Backward compatibility (deprecated)
export const MODELS = {
  PRO: POE_MODELS.CLAUDE_SONNET, // Map old gemini-pro to Claude
  FLASH: POE_MODELS.GLM, // Map old gemini-flash to GLM
} as const;

// MCP Protocol Constants
export const PROTOCOL = {
  // Message roles
  ROLES: {
    USER: "user",
    ASSISTANT: "assistant",
  },
  // Content types
  CONTENT_TYPES: {
    TEXT: "text",
  },
  // Status codes
  STATUS: {
    SUCCESS: "success",
    ERROR: "error",
    FAILED: "failed",
    REPORT: "report",
  },
  // Notification methods
  NOTIFICATIONS: {
    PROGRESS: "notifications/progress",
  },
  // Timeout prevention
  KEEPALIVE_INTERVAL: 25000, // 25 seconds
} as const;


// CLI Constants
export const CLI = {
  // Command names
  COMMANDS: {
    GEMINI: "gemini",
    ECHO: "echo",
  },
  // Command flags
  FLAGS: {
    MODEL: "-m",
    SANDBOX: "-s",
    PROMPT: "-p",
    HELP: "-help",
  },
  // Default values
  DEFAULTS: {
    MODEL: "default", // Fallback model used when no specific model is provided
    BOOLEAN_TRUE: "true",
    BOOLEAN_FALSE: "false",
  },
} as const;


// (merged PromptArguments and ToolArguments)
export interface ToolArguments {
  prompt?: string;
  model?: string;
  sandbox?: boolean | string;
  changeMode?: boolean | string;
  chunkIndex?: number | string; // Which chunk to return (1-based)
  chunkCacheKey?: string; // Optional cache key for continuation
  message?: string; // For Ping tool -- Un-used.
  
  // --> new tool
  methodology?: string; // Brainstorming framework to use
  domain?: string; // Domain context for specialized brainstorming
  constraints?: string; // Known limitations or requirements
  existingContext?: string; // Background information to build upon
  ideaCount?: number; // Target number of ideas to generate
  includeAnalysis?: boolean; // Include feasibility and impact analysis
  
  [key: string]: string | boolean | number | undefined; // Allow additional properties
}