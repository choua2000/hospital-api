import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { passport, env } from "../config/index";
import {
    registerSchema,
    loginSchema,
    customerLoginSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema,
} from "../validators/schemas";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validate(registerSchema), AuthController.register);
router.post("/admin/register", validate(registerSchema), AuthController.registerAdmin);
router.post("/customer/register", validate(registerSchema), AuthController.registerCustomer);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/admin/login", validate(loginSchema), AuthController.loginAdmin);
router.post("/customer/login", validate(customerLoginSchema), AuthController.loginCustomer);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send OTP to email for password reset
 * @access  Public
 */
router.post("/forgot-password", validate(forgotPasswordSchema), AuthController.forgotPassword);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and get reset token
 * @access  Public
 */
router.post("/verify-otp", validate(verifyOtpSchema), AuthController.verifyOtp);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using verified reset token
 * @access  Public
 */
router.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authenticate, AuthController.getMe);

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth Flow
 * @access  Public
 */
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth Callback
 * @access  Public
 */
router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${env.FRONTEND_URL}/login`,
    }),
    AuthController.googleCallback
);

export default router;
