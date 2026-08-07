import { Annotation } from "@langchain/langgraph";

export const RoadmapStateAnnotation = Annotation.Root({
  role: Annotation<string>,
  targetPackage: Annotation<string>,
  useResume: Annotation<boolean>,
  resume: Annotation<any>, // or precise Resume type
  roadmap: Annotation<any>, // or strict Roadmap schema
});

export type RoadmapState = typeof RoadmapStateAnnotation.State;
