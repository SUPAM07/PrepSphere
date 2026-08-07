import express, { Router } from "express";
import multer from "multer";
import { uploadResume, getResume, chargeDownload } from "../controllers/resume.controller.js";

const upload = multer({ storage: multer.memoryStorage() });

const resumeRouter: Router = express.Router();

resumeRouter.post("/upload", upload.single("resume"), uploadResume);
resumeRouter.get("/", getResume);
resumeRouter.post("/charge-download", chargeDownload);

export default resumeRouter;
