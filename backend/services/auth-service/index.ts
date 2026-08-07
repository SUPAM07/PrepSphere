import dotenv from "dotenv";
import dns from "dns";
import { parseEnv, authEnvSchema } from "../../shared/env.js";
import { startGrpcServer } from "./grpc/server.js";

dotenv.config();

const env = parseEnv(authEnvSchema);

dns.setServers(["1.1.1.1", "8.8.8.8"]);

import app from "./app.js";

app.listen(env.PORT, async () => {
  console.log(`Auth Service Running on port ${env.PORT}`);
  await startGrpcServer(50051);
});
