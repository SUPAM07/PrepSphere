import { z } from "zod";

// ----- Gateway Environment Schema -----

export const gatewayEnvSchema = z.object({
  PORT: z.coerce.number().default(8000),
  AUTH_SERVICE_URL: z.string().default("http://localhost:8001"),
  AUTH_SERVICE_GRPC_URL: z.string().default("localhost:50051"),
  INTERVIEW_SERVICE_URL: z.string().default("http://localhost:8002"),
  RESUME_SERVICE_URL: z.string().default("http://localhost:8003"),
  ROADMAP_SERVICE_URL: z.string().default("http://localhost:8004"),
  BILLING_SERVICE_URL: z.string().default("http://localhost:8005"),
});

export type GatewayEnv = z.infer<typeof gatewayEnvSchema>;

// ----- Auth Service Environment Schema -----

export const authEnvSchema = z.object({
  PORT: z.coerce.number().default(8001),
  POSTGRES_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  RABBITMQ_URL: z.string().default("amqp://localhost:5672"),
});

export type AuthEnv = z.infer<typeof authEnvSchema>;

// ----- Billing Service Environment Schema -----

export const billingEnvSchema = z.object({
  PORT: z.coerce.number().default(8005),
  POSTGRES_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  RABBITMQ_URL: z.string().default("amqp://localhost:5672"),
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  RAZORPAY_WEBHOOK_SECRET: z.string(),
});

export type BillingEnv = z.infer<typeof billingEnvSchema>;

// ----- Redis Environment Schema -----

export const redisEnvSchema = z.object({
  REDIS_URL: z.string().default("redis://localhost:6379"),
});

export type RedisEnv = z.infer<typeof redisEnvSchema>;

// ----- Interview Service Environment Schema -----

export const interviewEnvSchema = z.object({
  PORT: z.coerce.number().default(8002),
  MONGODB_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  GROQ_API_KEY: z.string(),
});

export type InterviewEnv = z.infer<typeof interviewEnvSchema>;

// ----- Resume Service Environment Schema -----

export const resumeEnvSchema = z.object({
  PORT: z.coerce.number().default(8004),
  MONGODB_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  GROQ_API_KEY: z.string(),
});

export type ResumeEnv = z.infer<typeof resumeEnvSchema>;

// ----- Roadmap Service Environment Schema -----

export const roadmapEnvSchema = z.object({
  PORT: z.coerce.number().default(8003),
  MONGODB_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  GROQ_API_KEY: z.string(),
});

export type RoadmapEnv = z.infer<typeof roadmapEnvSchema>;

// ----- Helper to parse and validate env -----

export function parseEnv<T extends z.ZodTypeAny>(
  schema: T,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>
): z.infer<T> {
  const result = schema.safeParse(env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.format());
    process.exit(1);
  }
  return result.data;
}
