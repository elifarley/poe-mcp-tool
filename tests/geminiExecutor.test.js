import { describe, it } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'child_process';
import { executeGeminiCLI } from '../dist/utils/geminiExecutor.js';

// Check if gemini CLI is available
function isGeminiAvailable() {
  return new Promise((resolve) => {
    const child = spawn('gemini', ['--version'], { stdio: 'ignore' });
    child.on('close', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

describe('executeGeminiCLI integration tests', async () => {
  const geminiAvailable = await isGeminiAvailable();
  
  if (!geminiAvailable) {
    console.log('⚠️  Skipping integration tests: gemini CLI not available');
    return;
  }

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