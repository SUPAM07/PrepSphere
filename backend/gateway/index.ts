import express from "express";
import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { parseEnv, gatewayEnvSchema } from "../shared/env.js";
import { isAuth } from "./middlewares/isAuth.js";
import { getCurrentUser } from "./controllers/user.controller.js";
import { proxyWithUser } from "./utils/proxyWithHeaders.js";

// Validate environment variables at startup
const env = parseEnv(gatewayEnvSchema);

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", env.FRONTEND_URL],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());

// Health check
app.get("/", (_req, res) => {
  res.send("hello from Server");
});

// Auth service (public — no isAuth)
app.use("/api/auth", proxyWithUser(env.AUTH_SERVICE_URL));

// Protected routes
app.get("/api/me", isAuth, getCurrentUser);
app.use("/api/interview", isAuth, proxyWithUser(env.INTERVIEW_SERVICE_URL));
app.use("/api/resume", isAuth, proxyWithUser(env.RESUME_SERVICE_URL, { parseReqBody: false }));
app.use("/api/roadmap", isAuth, proxyWithUser(env.ROADMAP_SERVICE_URL));

// Billing - Webhook is public, everything else is protected
app.use("/api/billing/webhook", proxyWithUser(env.BILLING_SERVICE_URL, {
  proxyReqPathResolver: () => "/webhook",
}));
app.use("/api/billing", isAuth, proxyWithUser(env.BILLING_SERVICE_URL));

app.listen(env.PORT, () => {
  console.log(`Gateway Started on ${env.PORT}`);
});
