import dotenv from "dotenv";
import dns from "dns";
import { parseEnv, billingEnvSchema } from "../../shared/env.js";
import app from "./app.js";
import { startOutboxWorker } from "./messaging/outboxWorker.js";
import { startPaymentConsumer } from "./messaging/paymentConsumer.js";
import { startRefundConsumer } from "./messaging/refundConsumer.js";
import { startRpcResponder } from "./messaging/rpcHandler.js";
import { startUserRegistrationConsumer } from "./messaging/userRegistrationConsumer.js";

dotenv.config();

const env = parseEnv(billingEnvSchema);

dns.setServers(["1.1.1.1", "8.8.8.8"]);

app.listen(env.PORT, () => {
  console.log(`✅ Billing Service started on port ${env.PORT}`);
  console.log(`🐘 Connected to PostgreSQL via Drizzle ORM`);
  startOutboxWorker();
  startPaymentConsumer();
  startRefundConsumer();
  startRpcResponder();
  startUserRegistrationConsumer();
});
