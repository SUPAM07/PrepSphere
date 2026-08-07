import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error?.name === "ZodError") {
        res.status(400).json({
          success: false,
          message: "Invalid payload",
          errors: error.format(),
        });
        return;
      }
      next(error);
    }
  };
};
