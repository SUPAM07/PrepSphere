import crypto from "crypto";
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { payments, outboxEvents } from "../db/schema.js";
import { asyncHandler } from "../../../shared/middlewares/asyncHandler.js";

export const razorpayWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
  const signature = req.headers["x-razorpay-signature"] as string;
  
  if (!signature) {
    res.status(400).send("Signature missing");
    return;
  }

  // Validate the webhook signature.
  // We stringify the req.body because Express usually parses it as JSON.
  // Note: For perfect signature matching, raw body parsing (express.raw) is recommended in the router.
  const payloadStr = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payloadStr)
    .digest("hex");

  if (expectedSignature !== signature) {
    res.status(400).send("Invalid signature");
    return;
  }

  const eventName = req.body.event;

  if (eventName === "payment.captured") {
    const paymentEntity = req.body.payload.payment.entity;
    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    // We search by razorpayOrderId as it's the one linked to our initial order
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.razorpayOrderId, razorpayOrderId));

    if (!payment) {
      // Payment not found in our DB, could be an old test or different env. Acknowledge anyway.
      res.status(200).send("OK");
      return;
    }

    if (payment.status !== "paid") {
      // Execute transactional outbox
      await db.transaction(async (tx) => {
        await tx
          .update(payments)
          .set({
            status: "paid",
            razorpayPaymentId: razorpayPaymentId,
            updatedAt: new Date(),
          })
          .where(eq(payments.id, payment.id));

        await tx.insert(outboxEvents).values({
          eventName: "payment.verified",
          payload: {
            userId: payment.userId,
            coins: payment.interviewCoins,
            paymentId: razorpayPaymentId,
          },
          status: "pending",
        });
      });
    }
  }

  res.status(200).send("OK");
});
