export function parseJsonFromLlm(llmOutput: string): any {
  try {
    // Attempt to extract JSON array or object using regex
    const match = llmOutput.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }

    // Fallback to basic string cleaning
    const cleaned = llmOutput
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error("Failed to parse JSON from LLM output");
  }
}
