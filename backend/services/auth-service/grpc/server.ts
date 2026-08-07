import * as grpc from "@grpc/grpc-js";
import db from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import redis from "../../../shared/redis/redis.js";
import { AuthServiceService, AuthServiceServer } from "../../../shared/proto/auth.js";

const server = new grpc.Server();

const authServiceImplementation: AuthServiceServer = {
  verifyToken: async (
    call: any,
    callback: any
  ) => {
    try {
      const sessionId = call.request.sessionId;

      if (!sessionId) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: "Session ID required"
        });
      }

      const sessionStr = await redis.get(`session:${sessionId}`);
      if (!sessionStr) {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: "Session expired"
        });
      }

      const session = JSON.parse(sessionStr);
      
      const userRes = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
      if (userRes.length === 0) {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: "User not found"
        });
      }
      const user = userRes[0]!;

      return callback(null, {
        userId: user.id,
        email: user.email,
        name: user.name || "",
      });
    } catch (error: any) {
      console.error("[gRPC] Error verifying token:", error);
      return callback({
        code: grpc.status.INTERNAL,
        message: error.message
      });
    }
  },
};

server.addService(AuthServiceService, authServiceImplementation as any);

export const startGrpcServer = (port: number | string = 50051) => {
  return new Promise<void>((resolve, reject) => {
    server.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      (error, boundPort) => {
        if (error) {
          console.error("[gRPC] Failed to bind server", error);
          return reject(error);
        }
        console.log(`Auth Service gRPC Server running on port ${boundPort}`);
        resolve();
      }
    );
  });
};
