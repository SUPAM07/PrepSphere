import { consumeEvent } from "../../../shared/messaging/consumer.js";
import { UserAccountRegisteredEvent } from "../../../shared/messaging/types.js";
import db from "../db/index.js";
import { userBilling } from "../db/schema.js";

export async function startUserRegistrationConsumer() {
  await consumeEvent(
    "user.account.registered",
    { queueName: "billing.user.registered.queue" },
    async (payload: UserAccountRegisteredEvent) => {
      console.log(`[BillingService] Initializing user_billing for new user ${payload.userId}`);

      // Insert with default 150 coins; ignore if already exists (idempotent)
      await db
        .insert(userBilling)
        .values({ userId: payload.userId, interviewCoins: 150 })
        .onConflictDoNothing();

      console.log(`[BillingService] user_billing initialized for user ${payload.userId}`);
    }
  );
}
