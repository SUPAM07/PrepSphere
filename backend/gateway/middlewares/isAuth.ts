import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../shared/types.js";
import { verifyTokenAsync } from "../grpc/client.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

// Load public key once at startup
const PUBLIC_KEY_PATH = path.resolve(process.cwd(), "../shared/keys/public.pem");
const PUBLIC_KEY = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized: Missing Bearer Token" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized: Missing Token Payload" });
      return;
    }

    // 1. Verify JWT Signature Statelessly
    let decoded: any;
    try {
      decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });
    } catch (err) {
      res.status(401).json({ message: "Unauthorized: Invalid or Expired Token" });
      return;
    }

    const sessionId = decoded.sessionId;
    if (!sessionId) {
      res.status(401).json({ message: "Unauthorized: Invalid Token Payload" });
      return;
    }

    // 2. Fast gRPC check to ensure session isn't revoked
    let response;
    try {
      response = await verifyTokenAsync(sessionId);
    } catch (grpcError: any) {
      // 16 = UNAUTHENTICATED in grpc.status
      if (grpcError.code === 16) {
        res.status(401).json({ message: grpcError.message || "Session Revoked" });
        return;
      }
      throw grpcError;
    }

    req.user = {
      userId: response.userId,
      email: response.email,
      name: response.name,
      interviewCoin: response.interviewCoin,
    };

    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    console.error("[isAuth JWT/gRPC Error]:", error);
    res.status(500).json({ message });
  }
};
