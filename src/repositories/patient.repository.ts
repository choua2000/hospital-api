// ============================================
// Patient Repository
// Data access layer for Patient model
// ============================================

import prisma from "../config/database";
import { Prisma } from "@prisma/client";

export class PatientRepository {
    /**
     * Create a new patient
     */
    async create(data: Prisma.PatientCreateInput) {
        return prisma.patient.create({ data });
    }

    /**
     * Find patient by ID with relations
     */
    async findById(id: string) {
        return prisma.patient.findUnique({
            where: { id },
            include: {
                appointments: {
                    include: { doctor: { include: { user: { select: { name: true } } } } },
                    orderBy: { date: "desc" },
                    take: 5,
                },
                medicalRecords: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
                bills: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
            },
        });
    }

    /**
     * Find patient by email
     */
    async findByEmail(email: string) {
        return prisma.patient.findFirst({
            where: { email },
        });
    }

    /**
     * Find all patients with pagination and search
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

        const where: Prisma.PatientWhereInput = search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { phone: { contains: search } },
                    { email: { contains: search, mode: "insensitive" } },
                ],
            }
            : {};

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            prisma.patient.count({ where }),
        ]);

        return {
            data: patients,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update a patient
     */
    async update(id: string, data: Prisma.PatientUpdateInput) {
        return prisma.patient.update({ where: { id }, data });
    }

    /**
     * Delete a patient
     */
    async delete(id: string) {
        return prisma.patient.delete({ where: { id } });
    }
}
