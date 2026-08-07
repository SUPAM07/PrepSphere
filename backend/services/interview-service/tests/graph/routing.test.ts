import { describe, it, expect } from 'vitest';
import { END } from '@langchain/langgraph';
import { router, feedbackRouter } from '../../graph/routing.js';

describe('Graph Routing', () => {
  describe('router', () => {
    it('returns "interviewAgent" when state.action === "start"', () => {
      const state: any = { action: 'start' };
      expect(router(state)).toBe('interviewAgent');
    });

    it('returns "feedbackAgent" when state.action === "feedback"', () => {
      const state: any = { action: 'feedback' };
      expect(router(state)).toBe('feedbackAgent');
    });

    it('returns END for any unknown action', () => {
      const state: any = { action: 'unknown' };
      expect(router(state)).toBe(END);
    });
  });

  describe('feedbackRouter', () => {
    it('returns "summaryAgent" when state.completed === true', () => {
      const state: any = { completed: true };
      expect(feedbackRouter(state)).toBe('summaryAgent');
    });

    it('returns END when state.completed === false', () => {
      const state: any = { completed: false };
      expect(feedbackRouter(state)).toBe(END);
    });

    it('returns END when state.completed is undefined', () => {
      const state: any = {};
      expect(feedbackRouter(state)).toBe(END);
    });
  });
});
