import crypto from "crypto";
import { getChannel } from "./connection.js";
import { ConsumeMessage } from "amqplib";

/**
 * Make an RPC call over RabbitMQ.
 * Creates an exclusive queue, sends the request with replyTo, and waits for the response.
 */
export async function rpcRequest<TReq, TRes>(queueName: string, payload: TReq, timeoutMs: number = 10000): Promise<TRes> {
  const channel = await getChannel();
  const q = await channel.assertQueue("", { exclusive: true });
  const correlationId = crypto.randomUUID();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      channel.deleteQueue(q.queue);
      reject(new Error(`RPC request to ${queueName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    channel.consume(
      q.queue,
      (msg: ConsumeMessage | null) => {
        if (msg && msg.properties.correlationId === correlationId) {
          clearTimeout(timeout);
          try {
            const response = JSON.parse(msg.content.toString()) as TRes;
            resolve(response);
          } catch (e) {
            reject(e);
          } finally {
            // Clean up the exclusive queue immediately
            channel.deleteQueue(q.queue).catch(() => {});
          }
        }
      },
      { noAck: true }
    );

    const messageBuffer = Buffer.from(JSON.stringify(payload));
    channel.sendToQueue(queueName, messageBuffer, {
      correlationId,
      replyTo: q.queue,
    });
  });
}

/**
 * Start an RPC responder on a specific queue.
 */
export async function rpcRespond<TReq, TRes>(
  queueName: string,
  handler: (payload: TReq) => Promise<TRes>
): Promise<void> {
  const channel = await getChannel();
  await channel.assertQueue(queueName, { durable: true });
  await channel.prefetch(1);

  channel.consume(queueName, async (msg: ConsumeMessage | null) => {
    if (!msg) return;

    let responsePayload: TRes | { error: string };
    try {
      const payload = JSON.parse(msg.content.toString()) as TReq;
      responsePayload = await handler(payload);
    } catch (error: any) {
      console.error(`[RabbitMQ] RPC Error in ${queueName}:`, error);
      responsePayload = { error: error.message || "Internal RPC Error" };
    }

    if (msg.properties.replyTo && msg.properties.correlationId) {
      channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(responsePayload)), {
        correlationId: msg.properties.correlationId,
      });
    }

    channel.ack(msg);
  });
  console.log(`[RabbitMQ] RPC Responder listening on ${queueName}`);
}
