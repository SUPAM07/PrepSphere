// Defines all event names and their typed payload shapes.
// Both publishers and consumers import from this single source of truth.

export const EXCHANGE = "fresherai.events";
export const DEAD_LETTER_EXCHANGE = "fresherai.events.dlx";

// --- Event Payload Interfaces ---

export interface PaymentVerifiedEvent {
  userId: string;
  coins: number;
  paymentId: string;
}

export interface RefundCoinsEvent {
  userId: string;
  amount: number;
  reason: string;
  refundId?: string; // Optional for backward compatibility but should be provided for idempotency
}

export interface UserAccountRegisteredEvent {
  userId: string;
}

// --- Event Registry ---
// Add new event types here as the system grows.

export type EventPayloads = {
  "payment.verified": PaymentVerifiedEvent;
  "coins.refund": RefundCoinsEvent;
  "user.account.registered": UserAccountRegisteredEvent;
};

export type EventName = keyof EventPayloads;

// --- RPC Types ---

export interface DeductCoinsRequest {
  userId: string;
  amount: number;
  action: string;
}

export interface DeductCoinsResponse {
  success: boolean;
  message?: string;
  error?: string;
}
