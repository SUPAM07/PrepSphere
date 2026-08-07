import { getChannel } from "./connection.js";
import { EXCHANGE, type EventName, type EventPayloads } from "./types.js";

/**
 * Publishes an event to the main exchange.
 * Fire-and-forget: does not block if the network drops (amqplib handles queueing).
 *
 * @param event The routing key (e.g., "payment.verified")
 * @param payload The strongly typed payload for that event
 */
export async function publishEvent<K extends EventName>(
  event: K,
  payload: EventPayloads[K]
): Promise<void> {
  try {
    const channel = await getChannel();
    const message = Buffer.from(JSON.stringify(payload));

    // Publish to the topic exchange using the event name as the routing key
    const success = channel.publish(EXCHANGE, event, message, {
      persistent: true, // Survive RabbitMQ restarts
    });

    if (!success) {
      console.warn(`[RabbitMQ] Publisher channel buffer full for event: ${event}`);
    } else {
      console.log(`[RabbitMQ] Published event: ${event}`);
    }
  } catch (error) {
    // We log but do not throw. 
    // In a real system, you might save to an Outbox table here if RabbitMQ is completely unreachable.
    console.error(`[RabbitMQ] Failed to publish event ${event}:`, error);
  }
}
