import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../validators/schemas";

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
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/admin/login", validate(loginSchema), AuthController.loginAdmin);
router.post("/customer/login", validate(loginSchema), AuthController.loginCustomer);

/**
 * @route   POST /api/auth/forgot-password
 */
router.post("/forgot-password", AuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 */
router.post("/reset-password", AuthController.resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authenticate, AuthController.getMe);

export default router;
