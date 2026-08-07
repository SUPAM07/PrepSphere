import { pgTable, uuid, varchar, integer, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const paymentStatusEnum = pgEnum("payment_status", ["created", "paid", "failed"]);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  interviewCoins: integer("interview_coins").notNull(),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  razorpaySignature: varchar("razorpay_signature", { length: 512 }),
  status: paymentStatusEnum("status").notNull().default("created"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export const outboxStatusEnum = pgEnum("outbox_status", ["pending", "published"]);

export const outboxEvents = pgTable("outbox_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventName: varchar("event_name", { length: 255 }).notNull(),
  payload: jsonb("payload").notNull(),
  status: outboxStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type OutboxEvent = typeof outboxEvents.$inferSelect;
export type NewOutboxEvent = typeof outboxEvents.$inferInsert;

// Coin balance — owned by billing domain, not auth
export const userBilling = pgTable("user_billing", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  interviewCoins: integer("interview_coins").notNull().default(150),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type UserBilling = typeof userBilling.$inferSelect;
export type NewUserBilling = typeof userBilling.$inferInsert;

