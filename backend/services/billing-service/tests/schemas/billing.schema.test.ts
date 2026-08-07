import { describe, it, expect } from 'vitest';
import { createOrderSchema, verifyPaymentSchema } from '../../schemas/billing.schema.js';

describe('Billing Schemas', () => {
  describe('createOrderSchema', () => {
    it('passes with { planId: "starter" }', () => {
      const result = createOrderSchema.safeParse({ planId: 'starter' });
      expect(result.success).toBe(true);
    });

    it('fails with empty string planId', () => {
      const result = createOrderSchema.safeParse({ planId: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Plan ID is required');
      }
    });

    it('fails when planId is missing entirely', () => {
      const result = createOrderSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('verifyPaymentSchema', () => {
    it('passes with all three Razorpay fields present', () => {
      const result = verifyPaymentSchema.safeParse({
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'sig_123',
      });
      expect(result.success).toBe(true);
    });

    it('fails when any one of the three fields is missing', () => {
      const result = verifyPaymentSchema.safeParse({
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});
