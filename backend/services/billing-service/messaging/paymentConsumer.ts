import { consumeEvent } from "../../../shared/messaging/consumer.js";
import db from "../db/index.js";
import { userBilling } from "../db/schema.js";
import { sql } from "drizzle-orm";

export async function startPaymentConsumer() {
  await consumeEvent(
    "payment.verified",
    { queueName: "billing.payment.verified.queue" },
    async ({ userId, coins, paymentId }) => {
      console.log(`[BillingService] Processing payment.verified for user ${userId}, payment: ${paymentId}`);

      // Upsert: create the user_billing row if it doesn't exist, then increment coins
      await db
        .insert(userBilling)
        .values({ userId, interviewCoins: coins })
        .onConflictDoUpdate({
          target: userBilling.userId,
          set: {
            interviewCoins: sql`${userBilling.interviewCoins} + ${coins}`,
            updatedAt: new Date(),
          },
        });

      console.log(`[BillingService] Successfully credited ${coins} coins to user ${userId}`);
    }
  );
}
