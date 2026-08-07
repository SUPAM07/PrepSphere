import express from "express";
import cookieParser from "cookie-parser";
import interviewRouter from "./routes/interview.route.js";
import { errorHandler } from "../../shared/middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", interviewRouter);

app.use(errorHandler);

export default app;
