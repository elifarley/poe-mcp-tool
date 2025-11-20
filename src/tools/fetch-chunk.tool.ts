import { z } from 'zod';
import { UnifiedTool } from './registry.js';
import { Logger } from '../utils/logger.js';

const inputSchema = z.object({
  cacheKey: z.string().describe("The cache key provided in the initial changeMode response"),
  chunkIndex: z.number().min(1).describe("Which chunk to retrieve (1-based index)")
});

export const fetchChunkTool: UnifiedTool = {
  name: 'fetch-chunk',
  description: 'Retrieves cached chunks from a changeMode response. Use this to get subsequent chunks after receiving a partial changeMode response.',
  
  zodSchema: inputSchema,
  
  prompt: {
    description: 'Fetch the next chunk of a response',
    arguments: [
      {
        name: 'prompt',
        description: 'fetch-chunk cacheKey=<key> chunkIndex=<number>',
        required: true
      }
    ]
  },
  
  category: 'utility',
  
  execute: async (args: any, onProgress?: (newOutput: string) => void): Promise<string> => {
    const { cacheKey, chunkIndex } = args;

    Logger.toolInvocation('fetch-chunk', args);
    Logger.debug(`Fetching chunk ${chunkIndex} with cache key: ${cacheKey}`);

    // TODO: Chunking not yet implemented for Poe API
    return `❌ Chunking feature not yet implemented for Poe API.

This feature was specific to Gemini's changeMode output format.
For Poe API, responses are returned in full (up to 100k characters).

If you need to process large responses, consider:
1. Breaking your request into smaller parts
2. Using more specific queries
3. Requesting summaries first, then details`;
  }
};