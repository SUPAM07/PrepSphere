import { pgTable, uuid, varchar, timestamp, boolean, pgEnum, index } from "drizzle-orm/pg-core";

export const accountStatusEnum = pgEnum("account_status", ["ACTIVE", "DISABLED", "LOCKED"]);
export const authProviderEnum = pgEnum("auth_provider", ["google", "github"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  name: varchar("name", { length: 255 }),
  isVerified: boolean("is_verified").notNull().default(false),
  accountStatus: accountStatusEnum("account_status").notNull().default("ACTIVE"),
  provider: authProviderEnum("provider"),
  providerId: varchar("provider_id", { length: 255 }),
  verificationOtp: varchar("verification_otp", { length: 255 }),
  otpExpiresAt: timestamp("otp_expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  sessionId: uuid("session_id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  device: varchar("device", { length: 255 }),
  browser: varchar("browser", { length: 255 }),
  os: varchar("os", { length: 255 }),
  ip: varchar("ip", { length: 45 }),
  country: varchar("country", { length: 100 }),
  refreshTokenHash: varchar("refresh_token_hash", { length: 512 }),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("sessions_user_id_idx").on(table.userId),
}));

export const processedEvents = pgTable("processed_events", {
  paymentId: varchar("payment_id", { length: 255 }).primaryKey(),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type ProcessedEvent = typeof processedEvents.$inferSelect;
