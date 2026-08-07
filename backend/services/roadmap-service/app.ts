import express from "express";
import cookieParser from "cookie-parser";
import roadmapRouter from "./routes/roadmap.route.js";
import { errorHandler } from "../../shared/middlewares/errorHandler.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/", roadmapRouter);

app.use(errorHandler);

export default app;
