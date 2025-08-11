import { describe, it } from 'node:test';
import assert from 'node:assert';
import { executeGeminiCLI } from '../dist/utils/geminiExecutor.js';

describe('executeGeminiCLI integration tests', () => {
  it('handles simple prompts', async () => {
    const result = await executeGeminiCLI('echo test');
    assert.ok(typeof result === 'string');
    assert.ok(result.length > 0);
  });

  it('handles prompts with special characters', async () => {
    const result = await executeGeminiCLI('What is 2+2?');
    assert.ok(typeof result === 'string');
    assert.ok(result.length > 0);
  });

  it('handles changeMode flag', async () => {
    const result = await executeGeminiCLI('test prompt', undefined, undefined, true);
    assert.ok(typeof result === 'string');
  });
});