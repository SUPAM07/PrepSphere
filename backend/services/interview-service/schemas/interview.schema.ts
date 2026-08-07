import { z } from "zod";

export const startInterviewSchema = z.object({
  type: z.enum(["hr", "technical"]),
  role: z.string().min(1, "Role is required"),
  useResume: z.boolean().optional().default(false),
  resume: z.any().optional(),
});

export const submitAnswerSchema = z.object({
  interviewId: z.string().min(1, "Interview Id is required"),
  answer: z.string().min(1, "Answer is required"),
});
