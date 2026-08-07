import express, { Router } from "express";
import { generateRoadmap, getAllRoadmaps, getRoadmapById } from "../controllers/roadmap.controller.js";
import { validateRequest } from "../../../shared/middlewares/validateRequest.js";
import { generateRoadmapSchema } from "../schemas/roadmap.schema.js";

const roadmapRouter: Router = express.Router();

roadmapRouter.post("/generate", validateRequest(generateRoadmapSchema), generateRoadmap);
roadmapRouter.get("/list", getAllRoadmaps);
roadmapRouter.get("/:id", getRoadmapById);

export default roadmapRouter;
