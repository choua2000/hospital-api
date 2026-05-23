// ============================================
// Appointment Repository
// Data access layer for Appointment model
// ============================================

import prisma from "../config/database";
import { Prisma } from "@prisma/client";

export class AppointmentRepository {
    /**
     * Create a new appointment
     */
    async create(data: Prisma.AppointmentCreateInput) {
        return prisma.appointment.create({
            data,
            include: {
                patient: { select: { id: true, name: true, phone: true } },
                doctor: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
        });
    }

    /**
     * Find appointment by ID
     */
    async findById(id: string) {
        return prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: true,
                doctor: {
                    include: {
                        user: { select: { id: true, name: true, email: true, imageUrl: true } },
                    },
                },
            },
        });
    }

    /**
     * Find all appointments with filters
     */
    async findAll(params: {
        page: number;
        limit: number;
        status?: string;
        doctorId?: string;
        patientId?: string;
        dateFrom?: string;
        dateTo?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) {
        const {
            page,
            limit,
            status,
            doctorId,
            patientId,
            dateFrom,
            dateTo,
            sortBy = "date",
            sortOrder = "desc",
        } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.AppointmentWhereInput = {
            ...(status && {
                status: status.includes(",") 
                    ? { in: status.split(",") as any } 
                    : (status as any)
            }),
            ...(doctorId && { doctorId }),
            ...(patientId && { patientId }),
            ...(dateFrom || dateTo
                ? {
                    date: {
                        ...(dateFrom && { gte: new Date(dateFrom) }),
                        ...(dateTo && { lte: new Date(dateTo) }),
                    },
                }
                : {}),
        };

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    patient: { select: { id: true, name: true, phone: true } },
                    doctor: {
                        include: {
                            user: { select: { name: true } },
                        },
                    },
                },
            }),
            prisma.appointment.count({ where }),
        ]);

        return {
            data: appointments,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update appointment
     */
    async update(id: string, data: Prisma.AppointmentUpdateInput) {
        return prisma.appointment.update({
            where: { id },
            data,
            include: {
                patient: { select: { id: true, name: true, phone: true } },
                doctor: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
        });
    }

    /**
     * Delete appointment
     */
    async delete(id: string) {
        return prisma.appointment.delete({ where: { id } });
    }
}
