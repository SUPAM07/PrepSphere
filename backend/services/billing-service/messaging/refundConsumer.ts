import { consumeEvent } from "../../../shared/messaging/consumer.js";
import { RefundCoinsEvent } from "../../../shared/messaging/types.js";
import db from "../db/index.js";
import { userBilling } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

export async function startRefundConsumer() {
  await consumeEvent(
    "coins.refund",
    { queueName: "billing.refunds" },
    async (payload: RefundCoinsEvent) => {
      try {
        console.log(`[BillingService] Processing refund of ${payload.amount} coins for user ${payload.userId} (${payload.reason})`);

        const updatedBilling = await db
          .update(userBilling)
          .set({
            interviewCoins: sql`${userBilling.interviewCoins} + ${payload.amount}`,
            updatedAt: new Date(),
          })
          .where(eq(userBilling.userId, payload.userId))
          .returning();

        if (updatedBilling.length === 0) {
          console.error(`[BillingService Refund] user_billing record for user ${payload.userId} not found`);
          return;
        }

        console.log(`[BillingService] Successfully refunded ${payload.amount} coins. New balance: ${updatedBilling[0]!.interviewCoins}`);
      } catch (error) {
        console.error("[BillingService Refund] Failed to process refund event:", error);
        throw error;
      }
    });
}
