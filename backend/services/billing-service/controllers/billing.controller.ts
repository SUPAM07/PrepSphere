import crypto from "crypto";
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import razorpay from "../configs/razorpay.js";
import db from "../db/index.js";
import { payments, outboxEvents, userBilling } from "../db/schema.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { asyncHandler } from "../../../shared/middlewares/asyncHandler.js";


const PLANS: Record<string, { amount: number; interviewCoins: number }> = {
  starter: {
    amount: 199,
    interviewCoins: 300,
  },
};

export const createOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { planId } = req.body;
  const userId = req.headers["x-user-id"] as string | undefined;

  if (!userId) {
    throw AppError.unauthorized("User ID header missing");
  }

  const plan = PLANS[planId];

  if (!plan) {
    throw new AppError("Invalid plan", 400);
  }

  const order = await razorpay.orders.create({
    amount: plan.amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  await db.insert(payments).values({
    userId,
    amount: plan.amount,
    interviewCoins: plan.interviewCoins,
    razorpayOrderId: order.id,
    status: "created",
  });

  res.status(201).json({
    success: true,
    order,
  });
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.razorpayOrderId, razorpay_order_id));

  if (!payment) {
    throw AppError.notFound("Payment not found");
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    await db
      .update(payments)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(payments.id, payment.id));

    throw new AppError("Payment verification failed", 400);
  }

  if (payment.status === "paid") {
    res.status(200).json({
      success: true,
      message: "Payment already verified",
    });
    return;
  }

  // IMPROVEMENT 1: Wrap status update + event publish in an atomic DB transaction.
  // If publishEvent throws, the entire transaction rolls back, keeping the DB consistent.
  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    await tx.insert(outboxEvents).values({
      eventName: "payment.verified",
      payload: {
        userId: payment.userId,
        coins: payment.interviewCoins,
        paymentId: razorpay_payment_id,
      },
      status: "pending",
    });
  });

  res.status(200).json({
    success: true,
    message: "Payment successful",
  });
});

export const getCoinBalance = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.headers["x-user-id"] as string | undefined;

  if (!userId) {
    throw AppError.unauthorized("User ID header missing");
  }

  // Upsert: if no row exists yet, initialize with 150 default coins
  const [billing] = await db
    .insert(userBilling)
    .values({ userId, interviewCoins: 150 })
    .onConflictDoUpdate({
      target: userBilling.userId,
      set: { updatedAt: new Date() }, // no-op update, just return the row
    })
    .returning();

  res.status(200).json({
    success: true,
    data: { interviewCoins: billing!.interviewCoins },
  });
});
