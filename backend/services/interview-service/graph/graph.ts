import { START, END, StateGraph } from "@langchain/langgraph";
import { InterviewStateAnnotation } from "./state.js";
import { interviewNode, feedbackNode, summaryNode } from "./nodes.js";
import { router, feedbackRouter } from "./routing.js";

// -------------------------------------
// Graph
// -------------------------------------

const graph = new StateGraph(InterviewStateAnnotation)
  // Nodes
  .addNode("interviewAgent", interviewNode)
  .addNode("feedbackAgent", feedbackNode)
  .addNode("summaryAgent", summaryNode)

  // START
  .addConditionalEdges(START, router, {
    interviewAgent: "interviewAgent",
    feedbackAgent: "feedbackAgent",
  })

  // Interview -> END
  .addEdge("interviewAgent", END)

  // Feedback -> Summary OR END
  .addConditionalEdges("feedbackAgent", feedbackRouter, {
    summaryAgent: "summaryAgent",
    [END]: END,
  })

  // Summary -> END
  .addEdge("summaryAgent", END)

  .compile();

export default graph;
