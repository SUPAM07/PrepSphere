import express, { Router } from "express";
import { createOrder, verifyPayment, getCoinBalance } from "../controllers/billing.controller.js";
import { razorpayWebhook } from "../controllers/webhook.controller.js";
import { validateRequest } from "../../../shared/middlewares/validateRequest.js";
import { createOrderSchema, verifyPaymentSchema } from "../schemas/billing.schema.js";

const paymentRouter: Router = express.Router();

paymentRouter.get("/coins", getCoinBalance);
paymentRouter.post("/create", validateRequest(createOrderSchema), createOrder);
paymentRouter.post("/verify", validateRequest(verifyPaymentSchema), verifyPayment);
paymentRouter.post("/webhook", razorpayWebhook);

export default paymentRouter;
