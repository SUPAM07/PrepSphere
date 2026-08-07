import { describe, it, expect, vi, beforeEach } from "vitest";
import { consumeEvent } from "../messaging/consumer.js";
import { getChannel } from "../messaging/connection.js";

vi.mock("../messaging/connection.js", () => ({
  getChannel: vi.fn(),
}));

describe("Consumer", () => {
  const mockAssertQueue = vi.fn();
  const mockBindQueue = vi.fn();
  const mockPrefetch = vi.fn();
  const mockConsume = vi.fn();
  const mockAck = vi.fn();
  const mockNack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (getChannel as any).mockResolvedValue({
      assertQueue: mockAssertQueue,
      bindQueue: mockBindQueue,
      prefetch: mockPrefetch,
      consume: mockConsume,
      ack: mockAck,
      nack: mockNack,
    });
  });

  it("should setup queues, bindings, and start consuming", async () => {
    const handler = vi.fn();

    await consumeEvent("payment.verified", { queueName: "test.queue" }, handler);

    expect(mockAssertQueue).toHaveBeenCalledWith("test.queue.dlq", { durable: true });
    expect(mockAssertQueue).toHaveBeenCalledWith("test.queue", {
      durable: true,
      deadLetterExchange: "fresherai.events.dlx",
      deadLetterRoutingKey: "payment.verified",
    });
    expect(mockBindQueue).toHaveBeenCalledWith("test.queue", "fresherai.events", "payment.verified");
    expect(mockPrefetch).toHaveBeenCalledWith(1);
    expect(mockConsume).toHaveBeenCalledWith("test.queue", expect.any(Function));
  });

  it("should ack the message on successful processing", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    await consumeEvent("payment.verified", { queueName: "test.queue" }, handler);

    // Get the consumer callback passed to channel.consume
    const consumerCallback = mockConsume.mock.calls[0][1];

    const mockMsg = {
      content: Buffer.from(JSON.stringify({ userId: "1", coins: 100, paymentId: "p1" })),
    };

    await consumerCallback(mockMsg);

    expect(handler).toHaveBeenCalledWith({ userId: "1", coins: 100, paymentId: "p1" });
    expect(mockAck).toHaveBeenCalledWith(mockMsg);
    expect(mockNack).not.toHaveBeenCalled();
  });

  it("should nack the message on handler error so it routes to DLQ", async () => {
    const handler = vi.fn().mockRejectedValue(new Error("DB failure"));
    await consumeEvent("payment.verified", { queueName: "test.queue" }, handler);

    const consumerCallback = mockConsume.mock.calls[0][1];

    const mockMsg = {
      content: Buffer.from(JSON.stringify({ userId: "1", coins: 100, paymentId: "p1" })),
    };

    await consumerCallback(mockMsg);

    expect(handler).toHaveBeenCalled();
    expect(mockAck).not.toHaveBeenCalled();
    // Verify it doesn't requeue to main queue (requeue = false)
    expect(mockNack).toHaveBeenCalledWith(mockMsg, false, false);
  });
});
