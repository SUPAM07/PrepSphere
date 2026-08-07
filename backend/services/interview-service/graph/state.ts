import { Annotation } from "@langchain/langgraph";

export const InterviewStateAnnotation = Annotation.Root({
  action: Annotation<string>,
  type: Annotation<string>,
  role: Annotation<string>,
  useResume: Annotation<boolean>,
  resume: Annotation<any>, // or strict type if known
  questions: Annotation<any[]>,
  question: Annotation<string>,
  answer: Annotation<string>,
  difficulty: Annotation<string>,
  feedback: Annotation<any>,
  report: Annotation<any>,
  completed: Annotation<boolean>,
});

export type InterviewState = typeof InterviewStateAnnotation.State;
