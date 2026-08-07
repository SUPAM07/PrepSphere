import llm from "../configs/llm.js";
import summaryPrompt from "../prompts/summary.prompt.js";

import { parseJsonFromLlm } from "../utils/parseJson.js";

export interface SummaryAgentData {
  role?: string;
  type?: string;
  questions?: any[];
}

export default async function summaryAgent(data: SummaryAgentData) {
  const prompt = summaryPrompt(data);
  const response = await llm.invoke(prompt);

  try {
    return parseJsonFromLlm(response.content as string);
  } catch (error) {
    console.error("Summary Agent Parse Error");
    console.error(response.content);
    throw new Error("Failed to generate interview summary.");
  }
}
