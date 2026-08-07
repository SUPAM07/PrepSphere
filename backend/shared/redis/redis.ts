import { Redis } from "ioredis";
import { parseEnv, redisEnvSchema } from "../env.js";

const { REDIS_URL } = parseEnv(redisEnvSchema);

const redis = new Redis(REDIS_URL);

export default redis;
