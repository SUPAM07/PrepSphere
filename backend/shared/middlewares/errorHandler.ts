import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle our custom operational errors
  if (err && typeof err === "object" && (err as any).name === "AppError") {
    res.status((err as any).statusCode).json({
      success: false,
      message: (err as any).message,
    });
    return;
  }

  // Handle Zod validation errors (fallback in case they bypass validateRequest middleware)
  if (err && typeof err === "object" && (err as any).name === "ZodError") {
    res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: (err as any).format ? (err as any).format() : err,
    });
    return;
  }

  // Handle Mongoose Duplicate Key Error
  if (typeof err === "object" && err !== null && "code" in err && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    res.status(409).json({
      success: false,
      message: `Duplicate field value entered: ${field}`,
    });
    return;
  }

  // Log unknown errors for internal debugging (avoid exposing stack in production)
  console.error("🔥 UNHANDLED ERROR:", err);

  const message =
    process.env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Something went wrong. Please try again later.";

  res.status(500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && err instanceof Error ? { stack: err.stack } : {}),
  });
};
