// ============================================
// User Repository
// Data access layer for User model
// ============================================

import prisma from "../config/database";
import { Prisma } from "@prisma/client";

export class UserRepository {
    /**
     * Create a new user
     */
    async create(data: Prisma.UserCreateInput) {
        return prisma.user.create({
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                imageUrl: true,
                isActive: true,
                createdAt: true,
            },
        });
    }

    /**
     * Find user by ID
     */
    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                imageUrl: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                doctor: true,
            },
        });
    }

    /**
     * Find user by email (includes password for auth)
     */
    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Find all users with pagination and search
     */
    async findAll(params: {
        page: number;
        limit: number;
        search?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) {
        const { page, limit, search, sortBy = "createdAt", sortOrder = "desc" } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    imageUrl: true,
                    isActive: true,
                    createdAt: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update a user by ID
     */
    async update(id: string, data: Prisma.UserUpdateInput) {
        return prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                imageUrl: true,
                isActive: true,
                updatedAt: true,
            },
        });
    }

    /**
     * Delete a user by ID
     */
    async delete(id: string) {
        return prisma.user.delete({ where: { id } });
    }

    /**
     * Find first user matching criteria
     */
    async findFirst(args: Prisma.UserFindFirstArgs) {
        return prisma.user.findFirst(args);
    }
}
