import { getChannel } from "./connection.js";
import { EXCHANGE, DEAD_LETTER_EXCHANGE, type EventName, type EventPayloads } from "./types.js";

export interface ConsumerOptions {
  queueName: string;
  prefetch?: number; // How many messages to process concurrently
}

/**
 * Subscribes to an event with Dead-Letter Queue (DLQ) support.
 * If the handler throws an error, the message is sent to the DLQ.
 *
 * @param event The routing key to listen for (e.g., "payment.verified")
 * @param options Queue configuration
 * @param handler The async function to process the payload
 */
export async function consumeEvent<K extends EventName>(
  event: K,
  options: ConsumerOptions,
  handler: (payload: EventPayloads[K]) => Promise<void>
): Promise<void> {
  try {
    const channel = await getChannel();
    const { queueName, prefetch = 1 } = options;

    const dlqName = `${queueName}.dlq`;

    // 1. Declare the Dead Letter Queue
    await channel.assertQueue(dlqName, { durable: true });
    await channel.bindQueue(dlqName, DEAD_LETTER_EXCHANGE, event);

    // 2. Declare the main queue, routing failed messages to the DLQ
    await channel.assertQueue(queueName, {
      durable: true,
      deadLetterExchange: DEAD_LETTER_EXCHANGE,
      deadLetterRoutingKey: event,
    });

    // 3. Bind the main queue to the main exchange
    await channel.bindQueue(queueName, EXCHANGE, event);

    // 4. Set prefetch limit (load balancing)
    await channel.prefetch(prefetch);

    console.log(`[RabbitMQ] Consumer started for queue: ${queueName} on event: ${event}`);

    // 5. Start consuming
    await channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const payload: EventPayloads[K] = JSON.parse(msg.content.toString());
        await handler(payload);

        // Acknowledge successful processing
        channel.ack(msg);
      } catch (error) {
        console.error(`[RabbitMQ] Error processing event ${event} in queue ${queueName}:`, error);

        // Nack (negative-acknowledge) and do NOT requeue into the main queue.
        // Because we configured deadLetterExchange, RabbitMQ will route it to the DLQ.
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    console.error(`[RabbitMQ] Failed to setup consumer for event ${event}:`, error);
    // In a robust system, you might want to process.exit(1) here if consuming is critical,
    // so Kubernetes/Docker restarts the pod.
  }
}
