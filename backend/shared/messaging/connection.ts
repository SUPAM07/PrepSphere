// Singleton amqplib connection and channel factory.
// Establishes one connection per process with automatic reconnect on ECONNRESET.

import amqplib, { type Channel } from "amqplib";
import { EXCHANGE, DEAD_LETTER_EXCHANGE } from "./types.js";

let connection: any = null;
let channel: Channel | null = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL ?? "amqp://localhost:5672";

async function connect(): Promise<void> {
  const conn = await amqplib.connect(RABBITMQ_URL);
  connection = conn;

  conn.on("error", (err: Error) => {
    console.error("[RabbitMQ] Connection error:", err.message);
    connection = null;
    channel = null;
  });

  conn.on("close", () => {
    console.warn("[RabbitMQ] Connection closed — will reconnect on next call.");
    connection = null;
    channel = null;
  });

  const ch = await conn.createChannel();
  channel = ch;

  // Declare the main topic exchange
  await ch.assertExchange(EXCHANGE, "topic", { durable: true });

  // Declare the dead-letter exchange for failed messages
  await ch.assertExchange(DEAD_LETTER_EXCHANGE, "topic", {
    durable: true,
  });

  console.log("[RabbitMQ] Connected and exchanges declared.");
}

export async function getChannel(): Promise<Channel> {
  if (!channel) {
    await connect();
  }
  return channel!;
}

export async function closeConnection(): Promise<void> {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch {
    // Ignore close errors — process is shutting down
  } finally {
    channel = null;
    connection = null;
  }
}
