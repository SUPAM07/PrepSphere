import { describe, it, expect, vi, beforeEach } from 'vitest';
import interviewAgent from '../../agents/interview.agent.js';
import llm from '../../configs/llm.js';
import hrInterviewPrompt from '../../prompts/hrInterviewPrompt.js';
import technicalInterviewPrompt from '../../prompts/technicalInterviewPrompt.js';

// Mock the dependencies
vi.mock('../../configs/llm.js', () => ({
  default: {
    invoke: vi.fn(),
  },
}));

vi.mock('../../prompts/hrInterviewPrompt.js', () => ({
  default: vi.fn(() => 'HR_PROMPT'),
}));

vi.mock('../../prompts/technicalInterviewPrompt.js', () => ({
  default: vi.fn(() => 'TECH_PROMPT'),
}));

describe('interviewAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the HR prompt when type === "hr"', async () => {
    vi.mocked(llm.invoke).mockResolvedValueOnce({ content: '[{"q":"HR Q"}]' });
    const data = { type: 'hr', role: 'developer' };
    
    await interviewAgent(data);
    
    expect(hrInterviewPrompt).toHaveBeenCalledWith(data);
    expect(technicalInterviewPrompt).not.toHaveBeenCalled();
    expect(llm.invoke).toHaveBeenCalledWith('HR_PROMPT');
  });

  it('calls the technical prompt when type !== "hr"', async () => {
    vi.mocked(llm.invoke).mockResolvedValueOnce({ content: '[{"q":"Tech Q"}]' });
    const data = { type: 'technical', role: 'developer' };
    
    await interviewAgent(data);
    
    expect(technicalInterviewPrompt).toHaveBeenCalledWith(data);
    expect(hrInterviewPrompt).not.toHaveBeenCalled();
    expect(llm.invoke).toHaveBeenCalledWith('TECH_PROMPT');
  });

  it('returns the parsed JSON from parseJsonFromLlm on valid LLM response', async () => {
    vi.mocked(llm.invoke).mockResolvedValueOnce({ content: '[{"q":"Q1"}]' });
    
    const result = await interviewAgent({ type: 'hr' });
    expect(result).toEqual([{ q: 'Q1' }]);
  });

  it('throws "Failed to generate interview questions." when LLM returns un-parseable output', async () => {
    vi.mocked(llm.invoke).mockResolvedValueOnce({ content: 'invalid' });
    
    // Suppress console.error in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    await expect(interviewAgent({ type: 'hr' })).rejects.toThrowError('Failed to generate interview questions.');
    
    consoleSpy.mockRestore();
  });
});
