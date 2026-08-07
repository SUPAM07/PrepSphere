import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import llm from "../configs/llm.js";
import roadmapPrompt from "../configs/roadmap.prompt.js";
import { RoadmapState } from "../states/roadmap.state.js";

const roadmapAgent = async (state: RoadmapState): Promise<Partial<RoadmapState>> => {
  try {
    const resume = state.useResume
      ? {
          skills: state.resume?.skills,
          missingSkills: state.resume?.missingSkills,
          projects: state.resume?.projects,
          experience: state.resume?.experience,
          score: state.resume?.score,
          suggestedRole: state.resume?.suggestedRole,
          recommendations: state.resume?.recommendations,
        }
      : null;

    const response = await llm.invoke([
      new SystemMessage(roadmapPrompt),
      new HumanMessage(`
Target Role:
${state.role}

Target Package:
${state.targetPackage}

Resume:
${JSON.stringify(resume, null, 2)}
`),
    ]);

    const roadmap = JSON.parse(
      (response.content as string)
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
    );

    const capitalize = (value = ""): string =>
      value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

    roadmap.level = capitalize(roadmap.level);

    roadmap.modules = (roadmap.modules || []).map((module: any) => ({
      ...module,
      difficulty: capitalize(module.difficulty),
    }));

    return {
      roadmap,
    };
  } catch (error) {
    console.error("Roadmap Agent Error:", error);
    throw error;
  }
};

export default roadmapAgent;
