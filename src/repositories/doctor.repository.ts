// ============================================
// Doctor Repository
// Data access layer for Doctor model
// ============================================

import prisma from "../config/database";
import { Prisma } from "@prisma/client";

export class DoctorRepository {
    /**
     * Create a new doctor profile
     */
    async create(data: Prisma.DoctorCreateInput) {
        return prisma.doctor.create({
            data,
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true, imageUrl: true },
                },
            },
        });
    }

    /**
     * Find doctor by ID with user info
     */
    async findById(id: string) {
        return prisma.doctor.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true, imageUrl: true },
                },
            },
        });
    }

    /**
     * Find doctor by user ID
     */
    async findByUserId(userId: string) {
        return prisma.doctor.findUnique({
            where: { userId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true, imageUrl: true },
                },
            },
        });
    }

    /**
     * Find all doctors with pagination and search
     */
    async findAll(params: {
        page: number;
        limit: number;
        search?: string;
        specialization?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) {
        const { page, limit, search, specialization, sortBy = "createdAt", sortOrder = "desc" } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.DoctorWhereInput = {
            ...(search && {
                OR: [
                    { specialization: { contains: search, mode: "insensitive" } },
                    { user: { name: { contains: search, mode: "insensitive" } } },
                ],
            }),
            ...(specialization && {
                specialization: { contains: specialization, mode: "insensitive" },
            }),
        };

        const [doctors, total] = await Promise.all([
            prisma.doctor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, role: true, imageUrl: true },
                    },
                },
            }),
            prisma.doctor.count({ where }),
        ]);

        return {
            data: doctors,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update a doctor profile
     */
    async update(id: string, data: Prisma.DoctorUpdateInput) {
        return prisma.doctor.update({
            where: { id },
            data,
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true, imageUrl: true },
                },
            },
        });
    }

    /**
     * Delete a doctor profile
     */
    async delete(id: string) {
        return prisma.doctor.delete({ where: { id } });
    }
}
