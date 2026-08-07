import express from "express";
import cookieParser from "cookie-parser";
import resumeRouter from "./routes/resume.route.js";
import { errorHandler } from "../../shared/middlewares/errorHandler.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/", resumeRouter);

app.use(errorHandler);

export default app;
