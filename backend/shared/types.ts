import { Request, Response, NextFunction } from "express";

// ----- Session / Auth Types -----

export interface SessionUser {
  userId: string;
  email: string;
  name?: string;
  interviewCoin?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: SessionUser;
}

// ----- Standard API Response Types -----

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ----- Middleware Type Aliases -----

export type ExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type AuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;
