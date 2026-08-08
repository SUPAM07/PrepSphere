import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import { errorHandler } from "../../shared/middlewares/errorHandler.js";

const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);

app.use(errorHandler);

export default app;
