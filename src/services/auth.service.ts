// ============================================
// Auth Service
// Business logic for authentication
// ============================================

import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";

const userRepository = new UserRepository();

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
        return this.register({ ...data, role: Role.USER });
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
        // Check if email already exists
        const existing = await userRepository.findByEmail(data.email);
        if (existing) {
            throw ApiError.conflict("Email already registered");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

        // Create user
        const user = await userRepository.create({
            name: data.name,
            email: data.email,
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
        // Allow USER and PATIENT roles for customer login
        if (result.user.role !== "USER" && result.user.role !== "PATIENT") {
            throw ApiError.forbidden("Access denied. Customer only.");
        }
        return result;
    }

    /**
     * Generic Login
     */
    async login(email: string, password: string) {
        // Find user by email
        const user = await userRepository.findByEmail(email);
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
     * - Generates reset token
     * - Saves to user
     * - In a real app, this would send an email
     */
    async forgotPassword(email: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw ApiError.notFound("User with this email not found");
        }

        // Generate a simple 6-digit code or a long token
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        await userRepository.update(user.id, {
            resetToken,
            resetTokenExpiry,
        });

        // Simulate sending email
        console.log(`Password reset token for ${email}: ${resetToken}`);

        return { message: "Password reset token generated. Check console for simulation.", resetToken };
    }

    /**
     * Reset Password
     */
    async resetPassword(data: any) {
        const { token, newPassword } = data;

        // Find user by reset token and ensure it's not expired
        const user = await userRepository.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            throw ApiError.unauthorized("Invalid or expired reset token");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);

        // Update user password and clear token
        await userRepository.update(user.id, {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null
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
}
