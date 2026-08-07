import llm from "../configs/llm.js";
import hrInterviewPrompt from "../prompts/hrInterviewPrompt.js";
import technicalInterviewPrompt from "../prompts/technicalInterviewPrompt.js";

import { parseJsonFromLlm } from "../utils/parseJson.js";

export interface InterviewAgentData {
  type?: string;
  role?: string;
  useResume?: boolean;
  resume?: any;
}

export default async function interviewAgent(data: InterviewAgentData) {
  const prompt =
    data.type?.toLowerCase() === "hr"
      ? hrInterviewPrompt(data)
      : technicalInterviewPrompt(data);

  const response = await llm.invoke(prompt);

  try {
    return parseJsonFromLlm(response.content as string);
  } catch (error) {
    console.error("Interview Agent Parse Error");
    console.error(response.content);
    throw new Error("Failed to generate interview questions.");
  }
}
