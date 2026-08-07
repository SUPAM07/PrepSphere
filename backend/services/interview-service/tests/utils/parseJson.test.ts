import { describe, it, expect } from 'vitest';
import { parseJsonFromLlm } from '../../utils/parseJson.js';

describe('parseJsonFromLlm', () => {
  it('parses a valid JSON array from LLM output', () => {
    const input = 'Here are your questions: [{"q": "what is JS?"}, {"q": "explain closure"}]';
    const result = parseJsonFromLlm(input);
    expect(result).toEqual([{ q: 'what is JS?' }, { q: 'explain closure' }]);
  });

  it('parses a valid JSON object from LLM output', () => {
    const input = '{"status": "success", "score": 9}';
    const result = parseJsonFromLlm(input);
    expect(result).toEqual({ status: 'success', score: 9 });
  });

  it('strips markdown fences (```json ... ```) and parses', () => {
    const input = '```json\n{"feedback": "good"}\n```';
    const result = parseJsonFromLlm(input);
    expect(result).toEqual({ feedback: 'good' });
  });

  it('extracts JSON embedded within surrounding prose text', () => {
    const input = 'I analyzed the response.\n\n```json\n{\n  "score": 10\n}\n```\n\nHope this helps.';
    const result = parseJsonFromLlm(input);
    expect(result).toEqual({ score: 10 });
  });

  it('throws Error("Failed to parse JSON from LLM output") on completely invalid input', () => {
    const input = 'Sorry, I cannot help with that request.';
    expect(() => parseJsonFromLlm(input)).toThrowError('Failed to parse JSON from LLM output');
  });
});
