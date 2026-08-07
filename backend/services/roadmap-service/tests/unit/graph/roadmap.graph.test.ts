import { describe, it, expect, vi } from 'vitest';
import graph from '../../../graph/roadmap.graph.js';
import roadmapAgent from '../../../agents/roadmap.agent.js';
import resourceAgent from '../../../agents/resource.agent.js';
import { StateGraph } from '@langchain/langgraph';

vi.mock('../../../agents/roadmap.agent.js', () => ({
  default: vi.fn(),
}));

vi.mock('../../../agents/resource.agent.js', () => ({
  default: vi.fn(),
}));

describe('Roadmap LangGraph Wiring', () => {
  it('exports a compiled LangGraph instance', () => {
    expect(graph).toBeDefined();
    expect(graph.invoke).toBeTypeOf('function');
  });

  // Since we cannot easily introspect the internal nodes of a compiled graph,
  // we are just checking that it doesn't throw on import and mock the agents.
});
