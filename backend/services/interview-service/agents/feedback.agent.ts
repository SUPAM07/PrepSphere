import llm from "../configs/llm.js";
import feedbackPrompt from "../prompts/feedback.prompt.js";

import { parseJsonFromLlm } from "../utils/parseJson.js";

export interface FeedbackAgentData {
  question?: string;
  answer?: string;
  difficulty?: string;
}

export default async function feedbackAgent(data: FeedbackAgentData) {
  const prompt = feedbackPrompt(data);
  const response = await llm.invoke(prompt);

  try {
    return parseJsonFromLlm(response.content as string);
  } catch (error) {
    console.error("========== Feedback Agent Parse Error ==========");
    console.error(response.content);
    console.error("===============================================");
    throw new Error("Failed to generate feedback.");
  }
}
