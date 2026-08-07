import { Request, Response } from "express";
import crypto from "crypto";
import Interview, { IQuestion } from "../model/interview.model.js";
import graph from "../graph/graph.js";
import redis from "../../../shared/redis/redis.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { asyncHandler } from "../../../shared/middlewares/asyncHandler.js";
import { rpcRequest } from "../../../shared/messaging/rpc.js";
import { DeductCoinsRequest, DeductCoinsResponse } from "../../../shared/messaging/types.js";

export const startInterview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.headers["x-user-id"] as string | undefined;

  if (!userId) {
    throw AppError.unauthorized();
  }

  const { type, role, useResume, resume } = req.body;

  // 1. Prevent concurrent active interviews
  const activeInterview = await Interview.findOne({ userId, status: "in-progress" });
  if (activeInterview) {
    throw new AppError("You already have an active interview. Please complete it first.", 400);
  }

  // Deduct 50 coins securely via RabbitMQ RPC
  const deductResult = await rpcRequest<DeductCoinsRequest, DeductCoinsResponse>("coins.deduct", {
    userId,
    amount: 50,
    action: "interview",
  });

  if (!deductResult.success) {
    throw new AppError(deductResult.error || "Not enough interview coins", 403);
  }

  let result;
  try {
    result = await graph.invoke({
      action: "start",
      type,
      role,
      useResume,
      resume,
    });

    const questions = result.questions;

    if (!questions || questions.length === 0) {
      throw new AppError("Failed to generate interview questions", 500);
    }

    const interview = await Interview.create({
      userId,
      type,
      role,
      useResume,
      questions,
      currentQuestion: 0,
      status: "in-progress",
    });

    await redis.del(`interviews:${userId}`);

    res.status(201).json({
      success: true,
      interviewId: interview._id,
      currentQuestion: 0,
      totalQuestions: interview.questions.length,
      question: interview.questions[0],
    });
  } catch (error) {
    // Compensating Transaction (Saga Rollback)
    const { publishEvent } = await import("../../../shared/messaging/publisher.js");
    await publishEvent("coins.refund", {
      userId,
      amount: 50,
      reason: "interview-generation-failed",
      refundId: crypto.randomUUID(),
    });
    throw error;
  }
});

export const submitAnswer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.headers["x-user-id"] as string | undefined;

  if (!userId) {
    throw AppError.unauthorized();
  }

  const { interviewId, answer } = req.body;

  // Acquire Redis Mutex Lock
  const lockKey = `lock:interview:${interviewId}`;
  const lockAcquired = await redis.set(lockKey, "locked", "EX", 30, "NX");
  
  if (!lockAcquired) {
    throw new AppError("Another request is processing for this interview. Please wait.", 429);
  }

  try {
    const interview = await Interview.findOne({ _id: interviewId, userId });

    if (!interview) {
      throw AppError.notFound("Interview not found");
    }

    if (interview.status === "completed") {
      throw new AppError("Interview already completed", 400);
    }

    const index = interview.currentQuestion;
    const currentQuestion = interview.questions[index] as IQuestion | undefined;

    if (!currentQuestion) {
      throw new AppError("Invalid question index", 400);
    }

    currentQuestion.userAnswer = answer;

    const completed = interview.currentQuestion + 1 >= interview.questions.length;

    const result = await graph.invoke({
      action: "feedback",
      question: currentQuestion.question,
      answer,
      difficulty: currentQuestion.difficulty,
      completed,
      role: interview.role,
      type: interview.type,
      questions: interview.questions,
    });

    currentQuestion.feedback = result.feedback;
    interview.currentQuestion++;

    if (completed) {
      interview.status = "completed";
      interview.overallScore = result.report?.overallScore || 0;
      interview.summary = result.report?.summary || "";
      interview.strengths = result.report?.strengths || [];
      interview.weaknesses = result.report?.weaknesses || [];
      interview.recommendations = result.report?.recommendations || [];

      await interview.save();
      await redis.del(`interviews:${userId}`);

      res.status(200).json({
        success: true,
        completed: true,
        interview,
      });
      return;
    }

    await interview.save();
    await redis.del(`interviews:${userId}`);

    res.status(200).json({
      success: true,
      completed: false,
      currentQuestion: interview.currentQuestion,
      question: interview.questions[interview.currentQuestion],
      feedback: result.feedback,
    });
  } finally {
    // Release the Redis Mutex Lock
    await redis.del(lockKey);
  }
});

export const getInterview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) {
    throw AppError.unauthorized();
  }

  const { id } = req.params;
  const interview = await Interview.findOne({ _id: id, userId });

  if (!interview) {
    throw AppError.notFound("Interview not found");
  }

  res.status(200).json({ success: true, interview });
});

export const getAllInterviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) {
    throw AppError.unauthorized();
  }

  const cacheKey = `interviews:${userId}`;
  const cache = await redis.get(cacheKey);

  if (cache) {
    console.log("✅ Data served from Redis");
    res.status(200).json(JSON.parse(cache));
    return;
  }

  const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });

  const completed = interviews.filter((item) => item.status === "completed");
  const totalQuestions = interviews.reduce((sum, item) => sum + item.questions.length, 0);
  const averageScore =
    completed.length > 0
      ? Number((completed.reduce((sum, item) => sum + item.overallScore, 0) / completed.length).toFixed(1))
      : 0;

  const stats = {
    totalInterviews: interviews.length,
    totalQuestions,
    completed: completed.length,
    averageScore,
  };

  const getAverageData = (list: any[]) => {
    const defaultData = [
      { skill: "Correctness", score: 0 },
      { skill: "Clarity", score: 0 },
      { skill: "Relevance", score: 0 },
      { skill: "Detail", score: 0 },
      { skill: "Efficiency", score: 0 },
      { skill: "Communication", score: 0 },
      { skill: "Problem solving", score: 0 },
      { skill: "Creativity", score: 0 },
    ];

    if (!list.length) return defaultData;

    const total = {
      correctness: 0,
      clarity: 0,
      relevance: 0,
      detail: 0,
      efficiency: 0,
      communication: 0,
      problemSolving: 0,
      creativity: 0,
    };

    list.forEach((interview) => {
      interview.questions.forEach((q: any) => {
        total.correctness += q.feedback?.correctness || 0;
        total.clarity += q.feedback?.clarity || 0;
        total.relevance += q.feedback?.relevance || 0;
        total.detail += q.feedback?.detail || 0;
        total.efficiency += q.feedback?.efficiency || 0;
        total.communication += q.feedback?.communication || 0;
        total.problemSolving += q.feedback?.problemSolving || 0;
        total.creativity += q.feedback?.creativity || 0;
      });
    });

    const count = list.reduce((sum, item) => sum + item.questions.length, 0);

    if (count === 0) return defaultData;

    return [
      { skill: "Correctness", score: Math.round(total.correctness / count) },
      { skill: "Clarity", score: Math.round(total.clarity / count) },
      { skill: "Relevance", score: Math.round(total.relevance / count) },
      { skill: "Detail", score: Math.round(total.detail / count) },
      { skill: "Efficiency", score: Math.round(total.efficiency / count) },
      { skill: "Communication", score: Math.round(total.communication / count) },
      { skill: "Problem solving", score: Math.round(total.problemSolving / count) },
      { skill: "Creativity", score: Math.round(total.creativity / count) },
    ];
  };

  const technicalInterviews = completed.filter((item) => item.type === "technical");
  const behaviouralInterviews = completed.filter((item) => item.type === "hr");

  const payload = {
    success: true,
    interviews,
    stats,
    technicalData: getAverageData(technicalInterviews),
    behaviouralData: getAverageData(behaviouralInterviews),
    technicalCount: technicalInterviews.length,
    hrCount: behaviouralInterviews.length,
  };

  await redis.set(cacheKey, JSON.stringify(payload), "EX", 600);
  res.status(200).json(payload);
});
