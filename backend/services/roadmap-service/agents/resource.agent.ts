import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import llm from "../configs/llm.js";
import searchVideo from "../configs/youtube.js";
import { RoadmapState } from "../states/roadmap.state.js";

const resourceAgent = async (state: RoadmapState): Promise<Partial<RoadmapState>> => {
  try {
    const roadmap = state.roadmap;
    if (!roadmap || !roadmap.modules) return {};

    const moduleTitles = roadmap.modules.map((module: any) => module.title).join("\n");

    const docsResponse = await llm.invoke([
      new SystemMessage(`
You are an expert software engineer.
For every module below return the official documentation.

Rules:
1. Prefer official documentation.
2. If official documentation does not exist, return the best learning article.
3. Return ONLY valid JSON.
4. Do not explain anything.
5. Keep the same title.

Return format:
[
  {
    "title":"",
    "article":""
  }
]
`),
      new HumanMessage(`
Modules:
${moduleTitles}
`),
    ]);

    let docs: any[] = [];
    try {
      docs = JSON.parse(
        (docsResponse.content as string)
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim()
      );
    } catch {
      docs = [];
    }

    const docsMap = new Map<string, string>();
    docs.forEach((item) => {
      if (item.title && item.article) {
        docsMap.set(item.title.toLowerCase(), item.article);
      }
    });

    roadmap.modules = await Promise.all(
      roadmap.modules.map(async (module: any) => {
        let video = null;
        try {
          video = await searchVideo(module.title);
        } catch (err: any) {
          console.error("Video search error:", err.message);
        }
        return {
          ...module,
          youtube: video?.url || "",
          article: docsMap.get(module.title.toLowerCase()) || "",
        };
      })
    );

    return { roadmap };
  } catch (error) {
    console.error("Resource Agent Error:", error);
    return {};
  }
};

export default resourceAgent;
