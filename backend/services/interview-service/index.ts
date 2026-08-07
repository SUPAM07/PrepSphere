import dotenv from "dotenv";
import dns from "dns";
import { connectDb } from "./configs/db.js";
import { parseEnv, interviewEnvSchema } from "../../shared/env.js";
import app from "./app.js";

dotenv.config();
const env = parseEnv(interviewEnvSchema);

dns.setServers(["1.1.1.1", "8.8.8.8"]);

app.listen(env.PORT, () => {
  console.log(`Interview Service Running on port ${env.PORT}`);
  connectDb();
});
