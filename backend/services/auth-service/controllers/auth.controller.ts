import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import fs from "fs";
import path from "path";
import db from "../db/index.js";
import { users, sessions } from "../db/schema.js";
import { eq, and, gt } from "drizzle-orm";
import redis from "../../../shared/redis/redis.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { asyncHandler } from "../../../shared/middlewares/asyncHandler.js";
import { publishEvent } from "../../../shared/messaging/publisher.js";

const PRIVATE_KEY_PATH = path.resolve(process.cwd(), "../../shared/keys/private.pem");
const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");

// Helpers
const generateTokens = (userId: string, sessionId: string) => {
  const accessToken = jwt.sign(
    { userId, sessionId },
    PRIVATE_KEY,
    { algorithm: "RS256", expiresIn: "15m" }
  );
  const refreshToken = crypto.randomBytes(40).toString("hex");
  return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  if (!email || !password) throw new AppError("Email and password required", 400);

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) throw new AppError("Email already in use", 400);

  const hashedPassword = await argon2.hash(password);
  const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(verificationOtp).digest("hex");
  const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const [newUser] = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
    isVerified: false,
    verificationOtp: hashedOtp,
    otpExpiresAt,
  }).returning({ id: users.id });

  // Notify billing service to initialize user_billing row with 150 default coins
  await publishEvent("user.account.registered", { userId: newUser!.id });

  // Mock sending email
  console.log(`\n\n=== EMAIL MOCK ===\nTo: ${email}\nSubject: Verify your account\nOTP: ${verificationOtp}\n==================\n\n`);

  res.status(201).json({ success: true, message: "Registration successful. Please verify your email." });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  const userRes = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), eq(users.verificationOtp, hashedOtp)))
    .limit(1);

  if (userRes.length === 0) throw new AppError("Invalid OTP", 400);
  const user = userRes[0]!;

  if (user.otpExpiresAt && user.otpExpiresAt < new Date()) throw new AppError("OTP expired", 400);

  await db
    .update(users)
    .set({
      isVerified: true,
      verificationOtp: null,
      otpExpiresAt: null,
    })
    .where(eq(users.id, user.id));

  res.json({ success: true, message: "Email verified successfully. You can now log in." });
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const userRes = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (userRes.length === 0 || !userRes[0]!.password) throw new AppError("Invalid credentials", 401);
  const user = userRes[0]!;

  const isMatch = await argon2.verify(user.password!, password);
  if (!isMatch) throw new AppError("Invalid credentials", 401);

  if (!user.isVerified) throw new AppError("Please verify your email first", 403);
  if (user.accountStatus !== "ACTIVE") throw new AppError("Account is disabled or locked", 403);

  const sessionId = crypto.randomUUID();
  const { accessToken, refreshToken } = generateTokens(user.id, sessionId);

  const refreshTokenHash = await argon2.hash(refreshToken);

  await db.insert(sessions).values({
    sessionId,
    userId: user.id,
    refreshTokenHash,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  // Sync to Redis for fast gRPC lookups
  await redis.set(
    `session:${sessionId}`,
    JSON.stringify({ userId: user.id, name: user.name, email: user.email }),
    "EX",
    30 * 24 * 60 * 60
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // true in prod
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, accessToken, user });
});



export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new AppError("Unauthorized", 401);

  const activeSessions = await db
    .select()
    .from(sessions)
    .where(gt(sessions.expiresAt, new Date()));

  let currentSession = null;
  for (const session of activeSessions) {
    if (session.refreshTokenHash && await argon2.verify(session.refreshTokenHash, refreshToken)) {
      currentSession = session;
      break;
    }
  }

  if (!currentSession) throw new AppError("Invalid refresh token", 401);

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(currentSession.userId, currentSession.sessionId);
  const newRefreshTokenHash = await argon2.hash(newRefreshToken);

  await db
    .update(sessions)
    .set({
      refreshTokenHash: newRefreshTokenHash,
      lastSeen: new Date(),
    })
    .where(eq(sessions.sessionId, currentSession.sessionId));

  await redis.expire(`session:${currentSession.sessionId}`, 30 * 24 * 60 * 60);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.json({ success: true });
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.json({ success: true });
    return;
  }
  let decoded: any;
  try { decoded = jwt.decode(token); } catch (e) { }

  if (decoded && decoded.sessionId) {
    await db.delete(sessions).where(eq(sessions.sessionId, decoded.sessionId));
    await redis.del(`session:${decoded.sessionId}`);
  }

  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out" });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) throw new AppError("Email is required", 400);

  const userRes = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (userRes.length === 0) {
    res.json({ success: true, message: "If an account exists, a reset OTP has been sent." });
    return;
  }
  const user = userRes[0]!;

  const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(resetOtp).digest("hex");
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await db
    .update(users)
    .set({
      verificationOtp: hashedOtp,
      otpExpiresAt,
    })
    .where(eq(users.id, user.id));

  console.log(`\n\n=== EMAIL MOCK ===\nTo: ${email}\nSubject: Password Reset OTP\nOTP: ${resetOtp}\n==================\n\n`);

  res.json({ success: true, message: "If an account exists, a reset OTP has been sent." });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) throw new AppError("Email, OTP, and new password are required", 400);

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  const userRes = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), eq(users.verificationOtp, hashedOtp)))
    .limit(1);
    
  if (userRes.length === 0) throw new AppError("Invalid or expired OTP", 400);
  const user = userRes[0]!;
  
  if (user.otpExpiresAt && user.otpExpiresAt < new Date()) throw new AppError("OTP expired", 400);

  const hashedPassword = await argon2.hash(newPassword);
  
  await db
    .update(users)
    .set({
      password: hashedPassword,
      verificationOtp: null,
      otpExpiresAt: null,
    })
    .where(eq(users.id, user.id));

  // Invalidate all existing sessions for security
  const userSessions = await db.select({ sessionId: sessions.sessionId }).from(sessions).where(eq(sessions.userId, user.id));
  await db.delete(sessions).where(eq(sessions.userId, user.id));

  if (userSessions.length > 0) {
    const pipeline = redis.pipeline();
    userSessions.forEach(s => pipeline.del(`session:${s.sessionId}`));
    await pipeline.exec();
  }

  res.json({ success: true, message: "Password reset successful. Please log in." });
});

