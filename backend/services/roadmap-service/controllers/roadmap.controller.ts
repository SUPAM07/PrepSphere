import { Request, Response } from "express";
import crypto from "crypto";
import redis from "../../../shared/redis/redis.js";
import graph from "../graph/roadmap.graph.js";
import Roadmap from "../model/roadmap.model.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { asyncHandler } from "../../../shared/middlewares/asyncHandler.js";
import { rpcRequest } from "../../../shared/messaging/rpc.js";
import { DeductCoinsRequest, DeductCoinsResponse } from "../../../shared/messaging/types.js";

export const generateRoadmap = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { role, targetPackage, useResume, resume } = req.body;
  const userId = req.headers["x-user-id"] as string | undefined;

  if (!userId) {
    throw AppError.unauthorized();
  }

  if (useResume && !resume) {
    throw new AppError("Resume data is required if useResume is true.", 400);
  }

  // Acquire Redis Mutex Lock
  const lockKey = `lock:roadmap-generate:${userId}`;
  const lockAcquired = await redis.set(lockKey, "locked", "EX", 60, "NX");
  
  if (!lockAcquired) {
    throw new AppError("Another roadmap is currently being generated. Please wait.", 429);
  }

  try {
    // Deduct 20 coins securely via RabbitMQ RPC
    const deductResult = await rpcRequest<DeductCoinsRequest, DeductCoinsResponse>("coins.deduct", {
      userId,
      amount: 20,
      action: "roadmap-generate",
    });

    if (!deductResult.success) {
      throw new AppError(deductResult.error || "Not enough interview coins", 403);
    }

    try {
      const result = await graph.invoke({
        role,
        targetPackage,
        useResume,
        resume,
      });

      const roadmap = await Roadmap.create({
        userId,
        ...result.roadmap,
      });

      await redis.set(`roadmap:${roadmap._id}`, JSON.stringify(roadmap), "EX", 60 * 60);
      await redis.del(`userRoadmaps:${userId}`);

      res.status(201).json({
        success: true,
        message: "Roadmap generated successfully.",
        data: roadmap,
      });
    } catch (error) {
      // Compensating Transaction (Saga Rollback)
      const { publishEvent } = await import("../../../shared/messaging/publisher.js");
      await publishEvent("coins.refund", {
        userId,
        amount: 20,
        reason: "roadmap-generation-failed",
        refundId: crypto.randomUUID(),
      });
      throw error;
    }
  } finally {
    // Release the Redis Mutex Lock
    await redis.del(lockKey);
  }
});

export const getAllRoadmaps = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) {
    throw AppError.unauthorized();
  }

  const cache = await redis.get(`userRoadmaps:${userId}`);
  if (cache) {
    res.json({
      success: true,
      data: JSON.parse(cache),
    });
    return;
  }

  const roadmaps = await Roadmap.find({ userId }).sort({ createdAt: -1 });

  await redis.set(`userRoadmaps:${userId}`, JSON.stringify(roadmaps), "EX", 60 * 60);

  res.json({
    success: true,
    data: roadmaps,
  });
});

export const getRoadmapById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.headers["x-user-id"] as string | undefined;

  if (!userId) {
    throw AppError.unauthorized();
  }

  const cache = await redis.get(`roadmap:${id}`);
  if (cache) {
    res.json({
      success: true,
      fromCache: true,
      data: JSON.parse(cache),
    });
    return;
  }

  const roadmap = await Roadmap.findOne({ _id: id, userId });
  if (!roadmap) {
    throw AppError.notFound("Roadmap not found");
  }

  await redis.set(`roadmap:${id}`, JSON.stringify(roadmap), "EX", 60 * 60);

  res.json({
    success: true,
    fromCache: false,
    data: roadmap,
  });
});
