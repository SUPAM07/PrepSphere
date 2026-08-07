import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/types.js";

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({
      success: false,
      message,
    });
  }
};
