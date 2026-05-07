// ============================================
// Medical Record Repository
// Data access layer for MedicalRecord model
// ============================================

import prisma from "../config/database";
import { Prisma } from "@prisma/client";

export class MedicalRecordRepository {
    /**
     * Create a new medical record
     */
    async create(data: Prisma.MedicalRecordCreateInput) {
        return prisma.medicalRecord.create({
            data,
            include: {
                patient: { select: { id: true, name: true } },
                doctor: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
        });
    }

    /**
     * Find medical record by ID
     */
    async findById(id: string) {
        return prisma.medicalRecord.findUnique({
            where: { id },
            include: {
                patient: true,
                doctor: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        });
    }

    /**
     * Find all medical records with filters
     */
    async findAll(params: {
        page: number;
        limit: number;
        patientId?: string;
        doctorId?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) {
        const { page, limit, patientId, doctorId, search, sortBy = "createdAt", sortOrder = "desc" } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.MedicalRecordWhereInput = {
            ...(patientId && { patientId }),
            ...(doctorId && { doctorId }),
            ...(search && {
                OR: [
                    { diagnosis: { contains: search, mode: "insensitive" } },
                    { prescription: { contains: search, mode: "insensitive" } },
                ],
            }),
        };

        const [records, total] = await Promise.all([
            prisma.medicalRecord.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    patient: { select: { id: true, name: true } },
                    doctor: {
                        include: {
                            user: { select: { name: true } },
                        },
                    },
                },
            }),
            prisma.medicalRecord.count({ where }),
        ]);

        return {
            data: records,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update medical record
     */
    async update(id: string, data: Prisma.MedicalRecordUpdateInput) {
        return prisma.medicalRecord.update({
            where: { id },
            data,
            include: {
                patient: { select: { id: true, name: true } },
                doctor: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
        });
    }

    /**
     * Delete medical record
     */
    async delete(id: string) {
        return prisma.medicalRecord.delete({ where: { id } });
    }
}
