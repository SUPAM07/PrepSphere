import express from "express";
import { register, verifyEmail, login, refresh, logout, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { validateRequest } from "../../../shared/middlewares/validateRequest.js";
import { registerSchema, loginSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema } from "../schemas/auth.schema.js";
import { loginLimiter, resetPasswordLimiter, generalAuthLimiter } from "../../../shared/middlewares/rateLimiter.js";

const router = express.Router();

router.post("/register", generalAuthLimiter, validateRequest(registerSchema), register);
router.post("/verify-email", generalAuthLimiter, validateRequest(verifyEmailSchema), verifyEmail);
router.post("/login", loginLimiter, validateRequest(loginSchema), login);
router.post("/refresh", refresh); // Internal/Secure token based, general limiter not strictly needed
router.post("/logout", logout);
router.post("/forgot-password", generalAuthLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", resetPasswordLimiter, validateRequest(resetPasswordSchema), resetPassword);


export default router;
