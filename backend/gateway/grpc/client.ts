import * as grpc from "@grpc/grpc-js";
import { AuthServiceClient, VerifyTokenResponse } from "../../shared/proto/auth.js";

const GRPC_URL = process.env.AUTH_SERVICE_GRPC_URL || "localhost:50051";

const client = new AuthServiceClient(
  GRPC_URL,
  grpc.credentials.createInsecure(),
  {
    "grpc.keepalive_time_ms": 120000,
    "grpc.keepalive_timeout_ms": 20000,
    "grpc.keepalive_permit_without_calls": 1,
    "grpc.max_connection_idle_ms": 100000,
    "grpc.max_connection_age_ms": 120000
  }
);

export const verifyTokenAsync = (sessionId: string): Promise<VerifyTokenResponse> => {
  return new Promise((resolve, reject) => {
    client.verifyToken({ sessionId }, (error: grpc.ServiceError | null, response: VerifyTokenResponse) => {
      if (error) {
        return reject(error);
      }
      resolve(response);
    });
  });
};
