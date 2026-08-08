import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register, login } from '../controllers/auth.controller.js';
import db from '../db/index.js';
import * as publisher from '../../../shared/messaging/publisher.js';
import argon2 from 'argon2';
import crypto from 'crypto';

// Setup file is loaded automatically via vitest.config, but we import types if needed
// Mock argon2 explicitly to avoid slow hashing during tests
vi.mock('argon2', () => ({
  default: {
    hash: vi.fn(async () => 'hashed_password'),
    verify: vi.fn(async (hash, pass) => hash === 'hashed_password' && pass === 'Password123!'),
  }
}));

describe('Auth Controller', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockReq = {
      body: {},
      headers: {},
      cookies: {}
    };
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };
  });

  describe('register', () => {
    it('should successfully register a new user and publish event', async () => {
      mockReq.body = { name: 'Test User', email: 'test@example.com', password: 'Password123!' };
      
      // Mock db returning empty for existing user check
      ((db as any).limit as any).mockResolvedValueOnce([]);
      
      // Mock db returning new user ID on insert
      ((db as any).returning as any).mockResolvedValueOnce([{ id: 'user-uuid' }]);

      await register(mockReq, mockRes, vi.fn());

      expect(db.insert).toHaveBeenCalled();
      expect(publisher.publishEvent).toHaveBeenCalledWith('user.account.registered', { userId: 'user-uuid' });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.stringContaining('Registration successful')
      }));
    });

    it('should throw an error if email already exists', async () => {
      mockReq.body = { name: 'Test', email: 'duplicate@example.com', password: 'Password123!' };
      const nextFn = vi.fn();
      
      // Mock db returning an existing user
      ((db as any).limit as any).mockResolvedValueOnce([{ id: 'existing-id' }]);

      await register(mockReq, mockRes, nextFn);
      
      expect(nextFn).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        message: 'Email already in use'
      }));
      expect(publisher.publishEvent).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully login and set cookie', async () => {
      mockReq.body = { email: 'verified@example.com', password: 'Password123!' };
      
      // Mock db returning a verified active user
      ((db as any).limit as any).mockResolvedValueOnce([{ 
        id: 'user-id', 
        name: 'Test', 
        email: 'verified@example.com',
        password: 'hashed_password',
        isVerified: true,
        accountStatus: 'ACTIVE'
      }]);

      await login(mockReq, mockRes, vi.fn());

      expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', expect.any(String), expect.any(Object));
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        accessToken: expect.any(String),
      }));
    });

    it('should block login if user is unverified', async () => {
      mockReq.body = { email: 'unverified@example.com', password: 'Password123!' };
      const nextFn = vi.fn();
      
      ((db as any).limit as any).mockResolvedValueOnce([{ 
        id: 'user-id', 
        password: 'hashed_password',
        isVerified: false,
        accountStatus: 'ACTIVE'
      }]);

      await login(mockReq, mockRes, nextFn);
      expect(nextFn).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 403,
        message: 'Please verify your email first'
      }));
    });
  });
});
