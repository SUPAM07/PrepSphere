import express from "express";
import paymentRouter from "./routes/billing.route.js";
import { errorHandler } from "../../shared/middlewares/errorHandler.js";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("hello from Billing-server");
});

app.use("/", paymentRouter);

app.use(errorHandler);

export default app;
