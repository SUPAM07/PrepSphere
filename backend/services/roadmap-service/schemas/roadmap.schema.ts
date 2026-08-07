import { z } from "zod";

export const generateRoadmapSchema = z.object({
  role: z.string().min(1, "Role is required"),
  targetPackage: z.string().min(1, "Target Package is required"),
  useResume: z.boolean().optional().default(false),
  resume: z.any().optional(),
});
