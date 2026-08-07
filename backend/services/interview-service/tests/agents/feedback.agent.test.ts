import { describe, it, expect, vi, beforeEach } from 'vitest';
import feedbackAgent from '../../agents/feedback.agent.js';
import llm from '../../configs/llm.js';
import feedbackPrompt from '../../prompts/feedback.prompt.js';

vi.mock('../../configs/llm.js', () => ({
  default: {
    invoke: vi.fn(),
  },
}));

vi.mock('../../prompts/feedback.prompt.js', () => ({
  default: vi.fn(() => 'FEEDBACK_PROMPT'),
}));

describe('feedbackAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invokes the LLM with the result of feedbackPrompt(data)', async () => {
    vi.mocked(llm.invoke).mockResolvedValueOnce({ content: '{"feedback":"good"}' });
    const data = { question: 'q1', answer: 'a1', difficulty: 'easy' };
    
    await feedbackAgent(data);
    
    expect(feedbackPrompt).toHaveBeenCalledWith(data);
    expect(llm.invoke).toHaveBeenCalledWith('FEEDBACK_PROMPT');
  });

  it('returns the parsed JSON result on success', async () => {
    vi.mocked(llm.invoke).mockResolvedValueOnce({ content: '{"feedback":"great"}' });
    
    const result = await feedbackAgent({});
    expect(result).toEqual({ feedback: 'great' });
  });

  it('throws "Failed to generate feedback." on LLM parse failure', async () => {
    vi.mocked(llm.invoke).mockResolvedValueOnce({ content: 'invalid json' });
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await expect(feedbackAgent({})).rejects.toThrowError('Failed to generate feedback.');
    
    consoleSpy.mockRestore();
  });
});
