/**
 * Poe API Client
 * Provides clean interface to Poe's OpenAI-compatible API
 * Extracted from poe-code project for MCP server integration
 */

export interface VerifyApiKeyOptions {
  apiKey: string;
}

export interface QueryOptions {
  apiKey: string;
  model: string;
  prompt: string;
}

export interface PoeApiClient {
  verify(options: VerifyApiKeyOptions): Promise<void>;
  query(options: QueryOptions): Promise<string>;
}

const POE_API_ENDPOINT = "https://api.poe.com/v1/chat/completions";

/**
 * HTTP client adapter for fetch API
 */
async function fetchClient(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, init);
}

export function createPoeApiClient(): PoeApiClient {
  const verify = async (options: VerifyApiKeyOptions): Promise<void> => {
    const requestBody = {
      model: "EchoBot",
      messages: [{ role: "user", content: "Ping" }]
    };

    let response: Response;
    let responseBody: unknown;

    try {
      response = await fetchClient(POE_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      responseBody = await response.json();

      if (!response.ok) {
        throw new Error(
          `Poe API test failed (${response.status}): ${JSON.stringify(responseBody)}`
        );
      }

      const echoed = extractMessageContent(responseBody);
      if (echoed !== "Ping") {
        throw new Error(
          `Poe API test failed: expected "Ping" but received "${echoed}"`
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Poe API')) {
        throw error;
      }
      throw new Error(`Failed to connect to Poe API: ${String(error)}`);
    }
  };

  const query = async (options: QueryOptions): Promise<string> => {
    const requestBody = {
      model: options.model,
      messages: [{ role: "user", content: options.prompt }]
    };

    let response: Response;
    let responseBody: unknown;

    try {
      response = await fetchClient(POE_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      responseBody = await response.json();

      if (!response.ok) {
        throw new Error(
          `Poe API query failed (${response.status}): ${JSON.stringify(responseBody)}`
        );
      }

      const content = extractMessageContent(responseBody);
      if (!content) {
        throw new Error(
          `Poe API query failed: missing response content in ${JSON.stringify(responseBody)}`
        );
      }
      return content;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Poe API')) {
        throw error;
      }
      throw new Error(`Failed to connect to Poe API: ${String(error)}`);
    }
  };

  return { verify, query };
}

type PoeChoice = {
  message?: {
    content?: unknown;
  } | null;
};

type PoeResponse = {
  choices?: PoeChoice[];
};

function extractMessageContent(payload: unknown): string | null {
  if (!isPoeResponse(payload)) {
    return null;
  }

  const [first] = payload.choices;
  if (!first || typeof first !== "object") {
    return null;
  }

  const content = first.message?.content;
  return typeof content === "string" ? content : null;
}

function isPoeResponse(value: unknown): value is { choices: PoeChoice[] } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as PoeResponse;
  return Array.isArray(candidate.choices) && candidate.choices.length > 0;
}
