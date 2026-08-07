import { describe, it, expect, vi, beforeEach } from 'vitest';
import roadmapAgent from '../../../agents/roadmap.agent.js';
import llm from '../../../configs/llm.js';
import { HumanMessage } from '@langchain/core/messages';
import { RoadmapState } from '../../../states/roadmap.state.js';

vi.mock('../../../configs/llm.js', () => ({
  default: {
    invoke: vi.fn(),
  },
}));

describe('Roadmap Agent Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates a roadmap without resume data when useResume is false', async () => {
    const mockLlmResponse = {
      content: JSON.stringify({ level: 'beginner', modules: [{ difficulty: 'easy' }] }),
    };
    vi.mocked(llm.invoke).mockResolvedValue(mockLlmResponse as any);

    const state: RoadmapState = {
      role: 'SWE',
      targetPackage: '10 LPA',
      useResume: false,
      resume: { skills: ['JS'] } as any, // Should be ignored
      roadmap: null,
      resources: [],
    };

    const result = await roadmapAgent(state);

    expect(llm.invoke).toHaveBeenCalled();
    const callArgs = vi.mocked(llm.invoke).mock.calls[0][0] as any[];
    const humanMessage = callArgs.find((msg) => msg instanceof HumanMessage);
    expect(humanMessage.content).toContain('null'); // JSON.stringify(null) for resume

    expect(result.roadmap).toEqual({
      level: 'Beginner',
      modules: [{ difficulty: 'Easy' }],
    });
  });

  it('includes resume data when useResume is true', async () => {
    const mockLlmResponse = {
      content: JSON.stringify({ level: 'advanced', modules: [{ difficulty: 'hard' }] }),
    };
    vi.mocked(llm.invoke).mockResolvedValue(mockLlmResponse as any);

    const state: RoadmapState = {
      role: 'SWE',
      targetPackage: '30 LPA',
      useResume: true,
      resume: { skills: ['Node.js'] } as any,
      roadmap: null,
      resources: [],
    };

    const result = await roadmapAgent(state);

    expect(llm.invoke).toHaveBeenCalled();
    const callArgs = vi.mocked(llm.invoke).mock.calls[0][0] as any[];
    const humanMessage = callArgs.find((msg) => msg instanceof HumanMessage);
    expect(humanMessage.content).toContain('Node.js');

    expect(result.roadmap).toEqual({
      level: 'Advanced',
      modules: [{ difficulty: 'Hard' }],
    });
  });

  it('cleans markdown from JSON output', async () => {
    const mockLlmResponse = {
      content: '```json\n{"level": "INTERMEDIATE", "modules": [{"difficulty": "MEDIUM"}]}\n```',
    };
    vi.mocked(llm.invoke).mockResolvedValue(mockLlmResponse as any);

    const state: RoadmapState = {
      role: 'SWE',
      targetPackage: '10 LPA',
      useResume: false,
      resume: null,
      roadmap: null,
      resources: [],
    };

    const result = await roadmapAgent(state);
    
    expect(result.roadmap.level).toBe('Intermediate');
    expect(result.roadmap.modules[0].difficulty).toBe('Medium');
  });

  it('throws an error if LLM fails', async () => {
    vi.mocked(llm.invoke).mockRejectedValue(new Error('LLM Timeout'));

    const state: RoadmapState = {
      role: 'SWE',
      targetPackage: '10 LPA',
      useResume: false,
      resume: null,
      roadmap: null,
      resources: [],
    };

    await expect(roadmapAgent(state)).rejects.toThrow('LLM Timeout');
  });
});
