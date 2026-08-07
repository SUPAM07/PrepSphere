import { END } from "@langchain/langgraph";
import { InterviewState } from "./state.js";

// -------------------------------------
// Router
// -------------------------------------

export function router(state: InterviewState): string {
  switch (state.action) {
    case "start":
      return "interviewAgent";
    case "feedback":
      return "feedbackAgent";
    default:
      return END;
  }
}

// -------------------------------------
// Feedback Router
// -------------------------------------

export function feedbackRouter(state: InterviewState): string {
  if (state.completed) {
    return "summaryAgent";
  }
  return END;
}
