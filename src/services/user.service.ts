// ============================================
// User Service
// Business logic for user management
// ============================================

import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

const userRepository = new UserRepository();

export class UserService {
    /**
     * Get all users with pagination
     */
    async getAll(params: {
        page: number;
        limit: number;
        search?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) {
        return userRepository.findAll(params);
    }

    /**
     * Get user by ID
     */
    async getById(id: string) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw ApiError.notFound("User not found");
        }
        return user;
    }

    /**
     * Update a user
     */
    async update(id: string, data: {
        name?: string;
        email?: string;
        role?: Role;
        isActive?: boolean;
    }) {
        // Check user exists
        const user = await userRepository.findById(id);
        if (!user) {
            throw ApiError.notFound("User not found");
        }

        // If email is being changed, check for duplicates
        if (data.email && data.email !== user.email) {
            const existing = await userRepository.findByEmail(data.email);
            if (existing) {
                throw ApiError.conflict("Email already in use");
            }
        }

        return userRepository.update(id, data);
    }

    /**
     * Upload user profile image
     */
    async uploadImage(id: string, file: Express.Multer.File) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw ApiError.notFound("User not found");
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.buffer, "users");

        // Update user with image URL
        return userRepository.update(id, { imageUrl: result.url });
    }

    /**
     * Delete a user
     */
    async delete(id: string) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw ApiError.notFound("User not found");
        }

        await userRepository.delete(id);
        return { message: "User deleted successfully" };
    }
}
