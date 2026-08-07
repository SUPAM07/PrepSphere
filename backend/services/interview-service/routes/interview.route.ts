import express, { Router } from "express";
import { startInterview, submitAnswer, getInterview, getAllInterviews } from "../controllers/interview.controller.js";
import { validateRequest } from "../../../shared/middlewares/validateRequest.js";
import { startInterviewSchema, submitAnswerSchema } from "../schemas/interview.schema.js";

const interviewRouter: Router = express.Router();

interviewRouter.post("/start", validateRequest(startInterviewSchema), startInterview);
interviewRouter.post("/answer", validateRequest(submitAnswerSchema), submitAnswer);
interviewRouter.get("/all", getAllInterviews);
interviewRouter.get("/:id", getInterview);

export default interviewRouter;
