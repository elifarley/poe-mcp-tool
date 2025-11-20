/**
 * Poe Chat Service
 * Advanced conversation management with tool calling and model strategy support
 * Adapted from poe-code project for MCP server integration
 */

import { Logger } from '../utils/logger.js';

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface Tool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  tools?: Tool[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ToolExecutor {
  executeTool(name: string, args: Record<string, unknown>): Promise<string>;
}

export interface ToolCallEvent {
  toolName: string;
  args: Record<string, unknown>;
  result?: string;
  error?: string;
}

export type ToolCallCallback = (event: ToolCallEvent) => void;

/**
 * Model selection strategy
 */
export type ModelStrategy = 'smart' | 'fixed' | 'mixed' | 'round-robin';

export interface ModelStrategyConfig {
  type: ModelStrategy;
  fixedModel?: string;
  customOrder?: string[];
}

export class PoeChatService {
  private apiKey: string;
  private baseUrl: string;
  private conversationHistory: ChatMessage[] = [];
  private currentModel: string;
  private toolExecutor?: ToolExecutor;
  private onToolCall?: ToolCallCallback;
  private strategyConfig?: ModelStrategyConfig;

  constructor(
    apiKey: string,
    model: string = "Claude-Sonnet-4.5",
    toolExecutor?: ToolExecutor,
    onToolCall?: ToolCallCallback,
    systemPrompt?: string
  ) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.poe.com/v1";
    this.currentModel = model;
    this.toolExecutor = toolExecutor;
    this.onToolCall = onToolCall;

    // Add system prompt if provided
    if (systemPrompt) {
      this.conversationHistory.push({
        role: "system",
        content: systemPrompt
      });
    }
  }

  setToolCallCallback(callback: ToolCallCallback): void {
    this.onToolCall = callback;
  }

  setModel(model: string): void {
    this.currentModel = model;
  }

  getModel(): string {
    return this.currentModel;
  }

  setStrategy(config: ModelStrategyConfig): void {
    this.strategyConfig = config;
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  addSystemMessage(content: string): void {
    this.conversationHistory.push({
      role: "system",
      content
    });
  }

  async sendMessage(
    userMessage: string,
    tools?: Tool[],
    options?: { signal?: AbortSignal; onChunk?: (chunk: string) => void }
  ): Promise<ChatMessage> {
    // Add user message to history
    this.conversationHistory.push({
      role: "user",
      content: userMessage
    });

    // Apply strategy-based model selection if configured
    if (this.strategyConfig) {
      this.currentModel = this.selectModelViaStrategy(userMessage);
    }

    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const response = await this.makeApiRequest(tools, options?.signal);

      const assistantMessage = response.choices[0].message;
      this.conversationHistory.push(assistantMessage);

      // Check if the model wants to call tools
      if (
        assistantMessage.tool_calls &&
        assistantMessage.tool_calls.length > 0 &&
        this.toolExecutor
      ) {
        // Execute all tool calls
        for (const toolCall of assistantMessage.tool_calls) {
          let result: string;
          let error: string | undefined;

          try {
            const args = JSON.parse(toolCall.function.arguments);

            // Notify callback that tool call is starting
            if (this.onToolCall) {
              this.onToolCall({
                toolName: toolCall.function.name,
                args
              });
            }

            result = await this.toolExecutor.executeTool(
              toolCall.function.name,
              args
            );

            // Notify callback of success
            if (this.onToolCall) {
              this.onToolCall({
                toolName: toolCall.function.name,
                args,
                result
              });
            }

            // Add tool result to conversation
            this.conversationHistory.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: result
            });
          } catch (err) {
            error = err instanceof Error ? err.message : String(err);

            // Notify callback of error
            if (this.onToolCall) {
              this.onToolCall({
                toolName: toolCall.function.name,
                args: JSON.parse(toolCall.function.arguments),
                error
              });
            }

            // Add error as tool result
            this.conversationHistory.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: `Error: ${error}`
            });
          }
        }

        // Continue the conversation with tool results
        attempts++;
        continue;
      }

      // No more tool calls, return the final message
      if (assistantMessage.content && assistantMessage.content.length > 0) {
        options?.onChunk?.(assistantMessage.content);
      }
      return assistantMessage;
    }

    throw new Error("Maximum tool call iterations reached");
  }

  /**
   * Simple model selection based on strategy
   */
  private selectModelViaStrategy(message: string): string {
    if (!this.strategyConfig) {
      return this.currentModel;
    }

    switch (this.strategyConfig.type) {
      case 'fixed':
        return this.strategyConfig.fixedModel || this.currentModel;

      case 'smart': {
        // Simple heuristic: code-related keywords → Codex, complex → GPT-5, default → Claude
        const lowerMessage = message.toLowerCase();
        const codeKeywords = ['code', 'function', 'class', 'implement', 'debug', 'refactor', 'algorithm'];
        const reasoningKeywords = ['why', 'how', 'explain', 'analyze', 'reasoning'];

        if (codeKeywords.some(kw => lowerMessage.includes(kw))) {
          return 'GPT-5.1-Codex';
        }
        if (reasoningKeywords.some(kw => lowerMessage.includes(kw)) && message.length > 500) {
          return 'GPT-5.1';
        }
        return 'Claude-Sonnet-4.5';
      }

      case 'mixed': {
        // Alternate between GPT-5.1 and Claude-Sonnet-4.5
        const alternateModels = ['GPT-5.1', 'Claude-Sonnet-4.5'];
        const currentIndex = alternateModels.indexOf(this.currentModel);
        return alternateModels[(currentIndex + 1) % alternateModels.length];
      }

      case 'round-robin': {
        const models = this.strategyConfig.customOrder || [
          'Claude-Sonnet-4.5',
          'GPT-5.1',
          'GPT-5.1-Codex',
          'glm-4.6'
        ];
        const currentIndex = models.indexOf(this.currentModel);
        return models[(currentIndex + 1) % models.length];
      }

      default:
        return this.currentModel;
    }
  }

  private async makeApiRequest(
    tools?: Tool[],
    signal?: AbortSignal
  ): Promise<ChatCompletionResponse> {
    const request: ChatCompletionRequest = {
      model: this.currentModel,
      messages: this.conversationHistory,
      temperature: 0.7
    };

    if (tools && tools.length > 0) {
      request.tools = tools;
    }

    Logger.debug(`[PoeChatService] Calling ${this.currentModel} with ${this.conversationHistory.length} messages`);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(request),
      signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Poe API request failed (${response.status}): ${errorText}`
      );
    }

    const result = await response.json();

    return result;
  }
}
