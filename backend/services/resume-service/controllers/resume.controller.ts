import { Request, Response } from "express";
import crypto from "crypto";


import Resume from "../model/resume.model.js";
import extractPdfText from "../configs/pdf.js";
import resumeAgent from "../agents/resume.agent.js";
import redis from "../../../shared/redis/redis.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { asyncHandler } from "../../../shared/middlewares/asyncHandler.js";
import { rpcRequest } from "../../../shared/messaging/rpc.js";
import { DeductCoinsRequest, DeductCoinsResponse } from "../../../shared/messaging/types.js";

export const uploadResume = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError("Resume PDF is required", 400);
    }

    const userId = req.headers["x-user-id"] as string | undefined;

    if (!userId) {
      throw new AppError("User Id is required", 400);
    }

    // Acquire Redis Mutex Lock
    const lockKey = `lock:resume-upload:${userId}`;
    const lockAcquired = await redis.set(lockKey, "locked", "EX", 60, "NX");
    
    if (!lockAcquired) {
      throw new AppError("Another resume is currently being processed. Please wait.", 429);
    }

    try {
      // Deduct 10 coins securely via RabbitMQ RPC
      const deductResult = await rpcRequest<DeductCoinsRequest, DeductCoinsResponse>("coins.deduct", {
        userId,
        amount: 10,
        action: "resume-score",
      });

      if (!deductResult.success) {
        throw new AppError(deductResult.error || "Not enough interview coins", 403);
      }

      try {
        const resumeText = await extractPdfText(req.file.buffer);
        const aiResponse = await resumeAgent(resumeText);

        let resumeData;
        try {
          const cleaned = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
          resumeData = JSON.parse(cleaned);
        } catch (e) {
          console.error("Failed to parse resume agent response", aiResponse);
          throw new AppError("Invalid AI Response format", 500);
        }

        let resume = await Resume.findOne({ userId });

        if (resume) {
          Object.assign(resume, {
            ...resumeData,
            extractedText: resumeText,
          });
          await resume.save();
        } else {
          resume = await Resume.create({
            userId,
            extractedText: resumeText,
            ...resumeData,
          });
        }

        await redis.set(`resume:${userId}`, JSON.stringify(resume));

        res.status(200).json({
          success: true,
          message: "Resume analyzed successfully",
          data: resume,
        });
      } catch (error) {
        // Compensating Transaction (Saga Rollback)
        const { publishEvent } = await import("../../../shared/messaging/publisher.js");
        await publishEvent("coins.refund", {
          userId,
          amount: 10,
          reason: "resume-generation-failed",
          refundId: crypto.randomUUID(),
        });
        throw error;
      }
    } finally {
      // Release the Redis Mutex Lock
      await redis.del(lockKey);
    }
  } catch (error) {
    throw error;
  }
});

export const getResume = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.headers["x-user-id"] as string | undefined;

  if (!userId) {
    throw new AppError("User Id is required", 400);
  }

  const cache = await redis.get(`resume:${userId}`);

  if (cache) {
    res.status(200).json({
      success: true,
      source: "redis",
      data: JSON.parse(cache),
    });
    return;
  }

  const resume = await Resume.findOne({ userId });

  if (!resume) {
    throw AppError.notFound("Resume not found");
  }

  await redis.set(`resume:${userId}`, JSON.stringify(resume));

  res.status(200).json({
    success: true,
    source: "mongodb",
    data: resume,
  });
});

export const chargeDownload = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.headers["x-user-id"] as string | undefined;

  if (!userId) {
    throw new AppError("User Id is required", 400);
  }

  // Acquire brief Redis Mutex Lock
  const lockKey = `lock:resume-download:${userId}`;
  const lockAcquired = await redis.set(lockKey, "locked", "EX", 5, "NX");
  
  if (!lockAcquired) {
    throw new AppError("Download already in progress. Please wait.", 429);
  }

  try {
    const resume = await Resume.findOne({ userId });
    
    if (!resume) {
      throw AppError.notFound("No resume found to download");
    }

    const deductResult = await rpcRequest<DeductCoinsRequest, DeductCoinsResponse>("coins.deduct", {
      userId,
      amount: 10,
      action: "resume-download",
    });

    if (!deductResult.success) {
      throw new AppError(deductResult.error || "Not enough interview coins", 403);
    }

    res.status(200).json({ success: true });
  } finally {
    // Release the Redis Mutex Lock
    await redis.del(lockKey);
  }
});
