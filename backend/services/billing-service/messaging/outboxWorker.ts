import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { outboxEvents } from "../db/schema.js";
import { publishEvent } from "../../../shared/messaging/publisher.js";

// Polling interval in ms
const POLLING_INTERVAL = 5000;

export function startOutboxWorker() {
  console.log(`[Billing Service] Outbox worker started, polling every ${POLLING_INTERVAL}ms`);
  
  setInterval(async () => {
    try {
      // 1. Fetch pending events
      const pendingEvents = await db
        .select()
        .from(outboxEvents)
        .where(eq(outboxEvents.status, "pending"))
        .limit(50); // Process in batches

      if (pendingEvents.length === 0) return;

      // 2. Iterate and publish
      for (const event of pendingEvents) {
        try {
          // Cast payload to any, but ideally we'd validate against EventPayloads
          await publishEvent(event.eventName as any, event.payload as any);
          
          // 3. Mark as published
          await db
            .update(outboxEvents)
            .set({
              status: "published",
              updatedAt: new Date(),
            })
            .where(eq(outboxEvents.id, event.id));
            
        } catch (error) {
          console.error(`[Outbox Worker] Failed to publish event ${event.id}:`, error);
          // Will be retried in the next polling cycle
        }
      }
    } catch (error) {
      console.error("[Outbox Worker] Error polling outbox events:", error);
    }
  }, POLLING_INTERVAL);
}
