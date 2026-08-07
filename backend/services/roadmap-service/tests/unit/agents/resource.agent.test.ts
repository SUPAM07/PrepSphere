import { describe, it, expect, vi, beforeEach } from 'vitest';
import resourceAgent from '../../../agents/resource.agent.js';
import llm from '../../../configs/llm.js';
import { RoadmapState } from '../../../states/roadmap.state.js';

vi.mock('../../../configs/llm.js', () => ({
  default: {
    invoke: vi.fn(),
  },
}));

vi.mock('../../../configs/youtube.js', () => ({
  default: vi.fn().mockResolvedValue({ title: 'Mock Video', url: 'http://mock' }),
}));

describe('Resource Agent Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates resources based on roadmap modules', async () => {
    const mockLlmResponse = {
      content: JSON.stringify([{ title: 'React', article: 'http://doc.com' }]),
    };
    vi.mocked(llm.invoke).mockResolvedValue(mockLlmResponse as any);

    const state: RoadmapState = {
      role: 'SWE',
      targetPackage: '10 LPA',
      useResume: false,
      resume: null,
      roadmap: { modules: [{ title: 'React' }] } as any,
    };

    const result = await resourceAgent(state);

    expect(llm.invoke).toHaveBeenCalled();
    expect(result.roadmap?.modules[0].article).toBe('http://doc.com');
    expect(result.roadmap?.modules[0].youtube).toBe('http://mock');
  });

  it('cleans markdown block from json output', async () => {
    const mockLlmResponse = {
      content: '```json\n[{"title": "Vue", "article": "http://vue.com"}]\n```',
    };
    vi.mocked(llm.invoke).mockResolvedValue(mockLlmResponse as any);

    const state: RoadmapState = {
      role: 'SWE',
      targetPackage: '10 LPA',
      useResume: false,
      resume: null,
      roadmap: { modules: [{ title: 'Vue' }] } as any,
    };

    const result = await resourceAgent(state);

    expect(result.roadmap?.modules[0].article).toBe('http://vue.com');
  });

  it('returns empty object if LLM fails', async () => {
    vi.mocked(llm.invoke).mockRejectedValue(new Error('API Error'));

    const state: RoadmapState = {
      role: 'SWE',
      targetPackage: '10 LPA',
      useResume: false,
      resume: null,
      roadmap: { modules: [] } as any,
    };

    const result = await resourceAgent(state);
    expect(result).toEqual({});
  });
});
