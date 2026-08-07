import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { startPaymentConsumer } from "../messaging/paymentConsumer.js";
import { consumeEvent } from "../../../shared/messaging/consumer.js";
import db from "../db/index.js";

vi.mock("../../../shared/messaging/consumer.js", () => ({
  consumeEvent: vi.fn(),
}));

// Create fluent mock chain
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockUpdate = vi.fn();
const mockSet = vi.fn();
const mockReturning = vi.fn();

mockSelect.mockReturnValue({ from: mockFrom });
mockFrom.mockReturnValue({ where: mockWhere });
mockWhere.mockReturnValue({ limit: mockLimit });

mockInsert.mockReturnValue({ values: mockValues });

mockUpdate.mockReturnValue({ set: mockSet });
mockSet.mockReturnValue({ where: mockWhere });
// Note: where() above returns limit(), we need returning() for update
mockWhere.mockReturnValue({ returning: mockReturning });

vi.mock("../db/index.js", () => ({
  default: {
    transaction: vi.fn(async (callback) => {
      // Pass the mocked tx object
      return callback({
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
      });
    }),
  }
}));

describe("Payment Consumer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockReset();
    mockValues.mockReset();
    mockReturning.mockReset();
    mockWhere.mockReturnValue({ limit: mockLimit, returning: mockReturning });
  });

  it("should start consuming the payment.verified event", async () => {
    await startPaymentConsumer();
    expect(consumeEvent).toHaveBeenCalledWith(
      "payment.verified",
      { queueName: "auth.payment.verified.queue" },
      expect.any(Function)
    );
  });

  it("should process a valid payment event, credit coins, and save processed event", async () => {
    await startPaymentConsumer();
    const handler = (consumeEvent as Mock).mock.calls[0][2];

    mockLimit.mockResolvedValue([]); // not processed
    mockValues.mockResolvedValue(true);
    mockReturning.mockResolvedValue([{ id: "user1", interviewCoin: 300 }]);

    await handler({ userId: "user1", coins: 300, paymentId: "pay_1" });

    expect(db.transaction).toHaveBeenCalled();
    expect(mockSelect).toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("should skip processing if the paymentId already exists (idempotency)", async () => {
    await startPaymentConsumer();
    const handler = (consumeEvent as Mock).mock.calls[0][2];

    mockLimit.mockResolvedValue([{ paymentId: "pay_1" }]); // already processed

    await handler({ userId: "user1", coins: 300, paymentId: "pay_1" });

    expect(mockSelect).toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should throw an error if the user is not found", async () => {
    await startPaymentConsumer();
    const handler = (consumeEvent as Mock).mock.calls[0][2];

    mockLimit.mockResolvedValue([]);
    mockValues.mockResolvedValue(true);
    mockReturning.mockResolvedValue([]); // user not found

    await expect(
      handler({ userId: "missing_user", coins: 300, paymentId: "pay_1" })
    ).rejects.toThrow("User missing_user not found when crediting coins.");
  });
});

