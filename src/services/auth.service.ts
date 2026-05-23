// ============================================
// Auth Service
// Business logic for authentication
// ============================================

import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";
import { sendEmail, generateOtpEmailHtml } from "../utils/sendEmail";

const userRepository = new UserRepository();

// OTP expires in 10 minutes
const OTP_EXPIRY_MINUTES = 10;

export class AuthService {
    /**
     * Register a new Admin
     */
    async registerAdmin(data: any) {
        return this.register({ ...data, role: Role.ADMIN });
    }

    /**
     * Register a new Customer/User
     */
    async registerCustomer(data: any) {
        return this.register({ ...data, role: Role.PATIENT });
    }

    /**
     * Internal register method
     */
    async register(data: {
        name: string;
        email: string;
        password: string;
        role?: Role;
    }) {
        const email = data.email.toLowerCase().trim();
        // Check if email already exists
        const existing = await userRepository.findByEmail(email);
        if (existing) {
            throw ApiError.conflict("Email already registered");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

        // Create user
        const user = await userRepository.create({
            name: data.name,
            email,
            password: hashedPassword,
            role: data.role || "USER",
        });

        // Generate JWT token
        const token = this.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });

        return { user, token };
    }

    /**
     * Login for Admin
     */
    async loginAdmin(email: string, password: string) {
        const result = await this.login(email, password);
        if (result.user.role !== "ADMIN") {
            throw ApiError.forbidden("Access denied. Admin only.");
        }
        return result;
    }

    /**
     * Login for Customer/User
     */
    async loginCustomer(email: string, password: string) {
        const result = await this.login(email, password);
        if (result.user.role !== "USER" && result.user.role !== "PATIENT") {
            throw ApiError.forbidden("Access denied. Customer only.");
        }
        return result;
    }

    /**
     * Internal Login Method
     */
    private async login(email: string, password: string) {
        const cleanEmail = email.toLowerCase().trim();
        // Find user by email
        const user = await userRepository.findByEmail(cleanEmail);
        if (!user) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        // Check if account is active
        if (!user.isActive) {
            throw ApiError.forbidden("Account has been deactivated");
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        // Generate token
        const token = this.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    /**
     * Forgot Password
     * - Generates a 6-digit OTP
     * - Hashes and saves OTP to database
     * - Sends OTP to user's email
     */
    async forgotPassword(email: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw ApiError.notFound("User with this email not found");
        }

        // Generate a 6-digit numeric OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Hash the OTP before storing (so DB leak doesn't expose codes)
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

        // Set expiry to 10 minutes from now
        const resetTokenExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Store hashed OTP and expiry
        await userRepository.update(user.id, {
            resetToken: hashedOtp,
            resetTokenExpiry,
        });

        // Send OTP email
        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset OTP - Hospital Management System",
                html: generateOtpEmailHtml(otp, user.name),
            });
        } catch (error) {
            // Clear the token if email fails so user can retry
            await userRepository.update(user.id, {
                resetToken: null,
                resetTokenExpiry: null,
            });
            console.error("Failed to send OTP email:", error);
            throw ApiError.internal("Failed to send OTP email. Please try again.");
        }

        return {
            message: `OTP has been sent to ${this.maskEmail(email)}`,
        };
    }

    /**
     * Verify OTP
     * - Validates the 6-digit OTP
     * - Returns a short-lived reset token for the next step
     */
    async verifyOtp(email: string, otp: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw ApiError.notFound("User with this email not found");
        }

        // Check if there's a pending OTP
        if (!user.resetToken || !user.resetTokenExpiry) {
            throw ApiError.badRequest("No OTP was requested. Please request a new one.");
        }

        // Check if OTP has expired
        if (new Date() > user.resetTokenExpiry) {
            // Clear expired token
            await userRepository.update(user.id, {
                resetToken: null,
                resetTokenExpiry: null,
            });
            throw ApiError.badRequest("OTP has expired. Please request a new one.");
        }

        // Hash the provided OTP and compare with stored hash
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
        if (hashedOtp !== user.resetToken) {
            throw ApiError.unauthorized("Invalid OTP. Please try again.");
        }

        // OTP is valid — generate a short-lived reset token (15 minutes)
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        // Replace OTP with verified reset token
        await userRepository.update(user.id, {
            resetToken: hashedResetToken,
            resetTokenExpiry,
        });

        return {
            message: "OTP verified successfully",
            resetToken,
        };
    }

    /**
     * Reset Password
     * - Uses the verified reset token from verifyOtp
     * - Updates the user's password
     */
    async resetPassword(data: { token: string; newPassword: string }) {
        const { token, newPassword } = data;

        // Hash the provided token to compare with stored hash
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Find user by reset token and ensure it's not expired
        const user = await userRepository.findFirst({
            where: {
                resetToken: hashedToken,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            throw ApiError.unauthorized("Invalid or expired reset token. Please restart the password reset process.");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);

        // Update user password and clear reset token
        await userRepository.update(user.id, {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        });

        return { message: "Password reset successfully" };
    }

    /**
     * Get current authenticated user profile
     */
    async getMe(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw ApiError.notFound("User not found");
        }
        return user;
    }

    /**
     * Handle Google OAuth success and generate JWT token
     */
    async googleLogin(user: any) {
        if (!user) {
            throw ApiError.unauthorized("Google authentication failed");
        }

        if (!user.isActive) {
            throw ApiError.forbidden("Account has been deactivated");
        }

        // Generate JWT token
        const token = this.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    /**
     * Generate JWT token
     */
    private generateToken(payload: {
        id: string;
        email: string;
        role: string;
        name: string;
    }): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN,
        } as jwt.SignOptions);
    }

    /**
     * Mask email for privacy (e.g., ch***@gmail.com)
     */
    private maskEmail(email: string): string {
        const [local, domain] = email.split("@");
        const masked = local.substring(0, 2) + "***";
        return `${masked}@${domain}`;
    }
}
