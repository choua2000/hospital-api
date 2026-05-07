import { BillRepository } from "../repositories/bill.repository";
import { ApiError } from "../utils/ApiError";
import { Prisma } from "@prisma/client";

const billRepository = new BillRepository();

export class BillService {
    async create(data: Prisma.BillCreateInput, items?: any[]) {
        return billRepository.create(data, items);
    }

    async getAll(params: {
        page: number;
        limit: number;
        patientId?: string;
        status?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) {
        return billRepository.findAll(params);
    }

    async getById(id: string) {
        const bill = await billRepository.findById(id);
        if (!bill) {
            throw ApiError.notFound("Bill not found");
        }
        return bill;
    }

    async update(id: string, data: Prisma.BillUpdateInput) {
        const bill = await billRepository.findById(id);
        if (!bill) {
            throw ApiError.notFound("Bill not found");
        }
        return billRepository.update(id, data);
    }

    async delete(id: string) {
        const bill = await billRepository.findById(id);
        if (!bill) {
            throw ApiError.notFound("Bill not found");
        }
        await billRepository.delete(id);
        return { message: "Bill deleted successfully" };
    }
}
