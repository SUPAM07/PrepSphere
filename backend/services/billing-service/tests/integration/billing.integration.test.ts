import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";

// Mock Drizzle db module
vi.mock("../../db/index.js", () => {
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockTransaction = vi.fn();

  return {
    default: {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      transaction: mockTransaction,
    },
  };
});

// Mock Razorpay
vi.mock("../../configs/razorpay.js", () => ({
  default: {
    orders: {
      create: vi.fn().mockResolvedValue({
        id: "order_mock123",
        amount: 19900,
        currency: "INR",
      }),
    },
  },
}));

// Mock RabbitMQ publisher
vi.mock("../../../../shared/messaging/publisher.js", () => ({
  publishEvent: vi.fn().mockResolvedValue(undefined),
}));

import db from "../../db/index.js";

describe("Billing Controller — createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if x-user-id header is missing", async () => {
    const res = await request(app)
      .post("/create")
      .send({ planId: "starter" });

    expect(res.status).toBe(401);
  });

  it("returns 400 for an invalid plan", async () => {
    const res = await request(app)
      .post("/create")
      .set("x-user-id", "user123")
      .send({ planId: "invalid_plan" });

    expect(res.status).toBe(400);
  });

  it("creates an order successfully for a valid plan", async () => {
    const mockInsertValues = vi.fn().mockResolvedValue([]);
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: mockInsertValues });

    const res = await request(app)
      .post("/create")
      .set("x-user-id", "user123")
      .send({ planId: "starter" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.order.id).toBe("order_mock123");
    expect(db.insert).toHaveBeenCalledOnce();
  });
});

describe("Billing Controller — verifyPayment", () => {
  const validBody = {
    razorpay_order_id: "order_mock123",
    razorpay_payment_id: "pay_mock456",
    razorpay_signature: "valid_sig",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 if payment record is not found", async () => {
    const mockWhere = vi.fn().mockResolvedValue([]);
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom });

    const res = await request(app)
      .post("/verify")
      .send(validBody);

    expect(res.status).toBe(404);
  });

  it("returns 400 if signature is invalid", async () => {
    const mockPayment = {
      id: "uuid-1",
      userId: "user123",
      interviewCoins: 300,
      status: "created",
      razorpayOrderId: "order_mock123",
    };
    const mockWhere = vi.fn().mockResolvedValue([mockPayment]);
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom });

    const mockSetWhere = vi.fn().mockResolvedValue([]);
    const mockSet = vi.fn().mockReturnValue({ where: mockSetWhere });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: mockSet });

    const res = await request(app)
      .post("/verify")
      .send({ ...validBody, razorpay_signature: "WRONG_SIG" });

    expect(res.status).toBe(400);
  });

  it("returns 200 if payment is already verified", async () => {
    const mockPayment = {
      id: "uuid-1",
      userId: "user123",
      interviewCoins: 300,
      status: "paid",
      razorpayOrderId: "order_mock123",
    };
    const mockWhere = vi.fn().mockResolvedValue([mockPayment]);
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom });

    // Needs the correct HMAC — use environment secret
    const crypto = await import("crypto");
    const sig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
      .update(`${validBody.razorpay_order_id}|${validBody.razorpay_payment_id}`)
      .digest("hex");

    const res = await request(app)
      .post("/verify")
      .send({ ...validBody, razorpay_signature: sig });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Payment already verified");
  });
});
