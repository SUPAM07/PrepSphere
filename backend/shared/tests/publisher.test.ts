import { describe, it, expect, vi, beforeEach } from "vitest";
import { publishEvent } from "../messaging/publisher.js";
import { getChannel } from "../messaging/connection.js";

vi.mock("../messaging/connection.js", () => ({
  getChannel: vi.fn(),
}));

describe("Publisher", () => {
  const mockPublish = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (getChannel as any).mockResolvedValue({
      publish: mockPublish,
    });
  });

  it("should publish a payment.verified event successfully", async () => {
    mockPublish.mockReturnValue(true);

    await publishEvent("payment.verified", {
      userId: "123",
      coins: 300,
      paymentId: "pay_123",
    });

    expect(getChannel).toHaveBeenCalled();
    expect(mockPublish).toHaveBeenCalledWith(
      "fresherai.events",
      "payment.verified",
      expect.any(Buffer),
      { persistent: true }
    );
  });

  it("should handle publish failure gracefully (fire-and-forget)", async () => {
    mockPublish.mockImplementation(() => {
      throw new Error("Channel closed");
    });

    // Should not throw an error since publishEvent wraps in try-catch
    await expect(
      publishEvent("payment.verified", { userId: "1", coins: 1, paymentId: "1" })
    ).resolves.toBeUndefined();
  });
});
