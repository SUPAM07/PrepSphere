import { describe, it, expect, vi, beforeEach } from 'vitest';
import summaryAgent from '../../agents/summary.agent.js';
import llm from '../../configs/llm.js';
import summaryPrompt from '../../prompts/summary.prompt.js';

vi.mock('../../configs/llm.js', () => ({
  default: {
    invoke: vi.fn(),
  },
}));

vi.mock('../../prompts/summary.prompt.js', () => ({
  default: vi.fn(() => 'SUMMARY_PROMPT'),
}));

describe('summaryAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invokes the LLM with the result of summaryPrompt(data)', async () => {
    vi.mocked(llm.invoke).mockResolvedValueOnce({ content: '{"summary":"good"}' });
    const data = { role: 'dev', type: 'tech', questions: [] };
    
    await summaryAgent(data);
    
    expect(summaryPrompt).toHaveBeenCalledWith(data);
    expect(llm.invoke).toHaveBeenCalledWith('SUMMARY_PROMPT');
  });

  it('returns the parsed JSON result on success', async () => {
    vi.mocked(llm.invoke).mockResolvedValueOnce({ content: '{"summary":"great"}' });
    
    const result = await summaryAgent({});
    expect(result).toEqual({ summary: 'great' });
  });

  it('throws "Failed to generate interview summary." on parse failure', async () => {
    vi.mocked(llm.invoke).mockResolvedValueOnce({ content: 'invalid json' });
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await expect(summaryAgent({})).rejects.toThrowError('Failed to generate interview summary.');
    
    consoleSpy.mockRestore();
  });
});
