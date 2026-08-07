import dotenv from "dotenv";
import dns from "dns";
import { connectDb } from "./configs/db.js";
import { parseEnv, resumeEnvSchema } from "../../shared/env.js";
import app from "./app.js";

dotenv.config();
const env = parseEnv(resumeEnvSchema);

dns.setServers(["1.1.1.1", "8.8.8.8"]);

app.listen(env.PORT, () => {
  console.log(`Resume Service Started on port ${env.PORT}`);
  connectDb();
});
