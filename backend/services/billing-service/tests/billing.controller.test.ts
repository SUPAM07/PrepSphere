import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, verifyPayment, getCoinBalance } from '../controllers/billing.controller.js';
import db from '../db/index.js';
import razorpay from '../configs/razorpay.js';
import crypto from 'crypto';
import { AppError } from '../../../shared/errors/AppError.js';

describe('Billing Controller', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockReq = {
      body: {},
      headers: {},
    };
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    mockNext = vi.fn();
  });

  describe('createOrder', () => {
    it('should throw unauthorized if x-user-id header is missing', async () => {
      mockReq.body = { planId: 'starter' };
      
      await createOrder(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 401,
        message: 'User ID header missing'
      }));
    });

    it('should successfully create a razorpay order and save to db', async () => {
      mockReq.headers['x-user-id'] = 'user-uuid';
      mockReq.body = { planId: 'starter' };
      
      (razorpay.orders.create as any).mockResolvedValueOnce({ id: 'order_123', amount: 19900 });
      // We do not need to override db.insert since the global mock returns dbMock and values() returns dbMock

      await createOrder(mockReq, mockRes, mockNext);

      expect(razorpay.orders.create).toHaveBeenCalledWith(expect.objectContaining({
        amount: 19900,
        currency: 'INR'
      }));
      expect(db.insert).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        order: expect.objectContaining({ id: 'order_123' })
      }));
    });
  });

  describe('verifyPayment', () => {
    it('should throw an error if signature is invalid', async () => {
      mockReq.body = {
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'invalid_signature'
      };
      
      ((db as any).where as any).mockResolvedValueOnce([{ id: 1, userId: 'user-uuid', status: 'created', interviewCoins: 300 }]);
      
      await verifyPayment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: 'Payment verification failed'
      }));
      // Status should be updated to failed
      expect(db.update).toHaveBeenCalled();
    });

    it('should verify signature and process payment via transaction', async () => {
      const orderId = 'order_123';
      const paymentId = 'pay_123';
      
      // Generate a valid signature for our mock
      process.env.RAZORPAY_KEY_SECRET = 'test_secret';
      const validSignature = crypto
        .createHmac("sha256", 'test_secret')
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      mockReq.body = {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature
      };
      
      ((db as any).where as any).mockResolvedValueOnce([{ id: 1, userId: 'user-uuid', status: 'created', interviewCoins: 300 }]);

      await verifyPayment(mockReq, mockRes, mockNext);

      expect(db.transaction).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Payment successful'
      }));
    });
  });

  describe('getCoinBalance', () => {
    it('should return coin balance for user', async () => {
      mockReq.headers['x-user-id'] = 'user-uuid';
      
      ((db as any).returning as any).mockResolvedValueOnce([{ interviewCoins: 150 }]);

      await getCoinBalance(mockReq, mockRes, mockNext);

      expect(db.insert).toHaveBeenCalled();
      expect((db as any).onConflictDoUpdate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: { interviewCoins: 150 }
      }));
    });
  });
});
