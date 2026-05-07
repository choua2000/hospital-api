// ============================================
// Bill Repository
// Data access layer for Bill & BillItem models
// ============================================

import prisma from "../config/database";
import { Prisma } from "@prisma/client";

export class BillRepository {
    /**
     * Create a new bill with optional line items
     */
    async create(
        data: Prisma.BillCreateInput,
        items?: { description: string; amount: number; quantity?: number }[]
    ) {
        return prisma.bill.create({
            data: {
                ...data,
                ...(items && {
                    billItems: {
                        create: items.map((item) => ({
                            description: item.description,
                            amount: item.amount,
                            quantity: item.quantity,
                        })),
                    },
                }),
            },
            include: {
                patient: { select: { id: true, name: true } },
                billItems: true,
            },
        });
    }

    /**
     * Find bill by ID
     */
    async findById(id: string) {
        return prisma.bill.findUnique({
            where: { id },
            include: {
                patient: true,
                billItems: true,
            },
        });
    }

    /**
     * Find all bills with filters
     */
    async findAll(params: {
        page: number;
        limit: number;
        patientId?: string;
        status?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) {
        const { page, limit, patientId, status, sortBy = "createdAt", sortOrder = "desc" } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.BillWhereInput = {
            ...(patientId && { patientId }),
            ...(status && { status: status as any }),
        };

        const [bills, total] = await Promise.all([
            prisma.bill.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    patient: { select: { id: true, name: true } },
                    billItems: true,
                },
            }),
            prisma.bill.count({ where }),
        ]);

        return {
            data: bills,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update bill
     */
    async update(id: string, data: Prisma.BillUpdateInput) {
        return prisma.bill.update({
            where: { id },
            data,
            include: {
                patient: { select: { id: true, name: true } },
                billItems: true,
            },
        });
    }

    /**
     * Delete bill
     */
    async delete(id: string) {
        return prisma.bill.delete({ where: { id } });
    }
}
