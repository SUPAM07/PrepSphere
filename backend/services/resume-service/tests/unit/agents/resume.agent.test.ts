import { describe, it, expect, vi, beforeEach } from 'vitest';
import resumeAgent from '../../../agents/resume.agent.js';
import llm from '../../../configs/llm.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

vi.mock('../../../configs/llm.js', () => ({
  default: {
    invoke: vi.fn(),
  },
}));

describe('Resume Agent Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('constructs prompt correctly and returns LLM text content', async () => {
    const mockLlmResponse = {
      content: JSON.stringify({ name: 'John', score: 85 }),
    };
    vi.mocked(llm.invoke).mockResolvedValue(mockLlmResponse as any);

    const result = await resumeAgent('Raw resume text');

    expect(llm.invoke).toHaveBeenCalled();
    const callArgs = vi.mocked(llm.invoke).mock.calls[0]![0] as any[];
    
    const systemMessage = callArgs.find((msg) => msg instanceof SystemMessage);
    const humanMessage = callArgs.find((msg) => msg instanceof HumanMessage);
    
    expect(systemMessage?.content).toContain('Expert ATS Resume Analyzer');
    expect(humanMessage?.content).toBe('Raw resume text');
    expect(result).toBe(mockLlmResponse.content);
  });

  it('throws an error if LLM fails', async () => {
    vi.mocked(llm.invoke).mockRejectedValue(new Error('LLM Timeout'));

    await expect(resumeAgent('text')).rejects.toThrow('LLM Timeout');
  });
});
