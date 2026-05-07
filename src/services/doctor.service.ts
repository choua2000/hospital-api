import { DoctorRepository } from "../repositories/doctor.repository";
import { ApiError } from "../utils/ApiError";
import { Prisma } from "@prisma/client";

const doctorRepository = new DoctorRepository();

export class DoctorService {
    async create(data: any) {
        const { userId, ...rest } = data;

        // Check if user already has a doctor profile
        const existing = await doctorRepository.findByUserId(userId);
        if (existing) {
            throw ApiError.conflict("User already has a doctor profile");
        }

        // Structure data for Prisma
        const doctorData: Prisma.DoctorCreateInput = {
            ...rest,
            user: {
                connect: { id: userId }
            }
        };

        return doctorRepository.create(doctorData);
    }

    /**
     * Get all doctors
     */
    async getAll(params: {
        page: number;
        limit: number;
        search?: string;
        specialization?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) {
        return doctorRepository.findAll(params);
    }

    /**
     * Get doctor by ID
     */
    async getById(id: string) {
        const doctor = await doctorRepository.findById(id);
        if (!doctor) {
            throw ApiError.notFound("Doctor profile not found");
        }
        return doctor;
    }

    /**
     * Get doctor by user ID
     */
    async getByUserId(userId: string) {
        const doctor = await doctorRepository.findByUserId(userId);
        if (!doctor) {
            throw ApiError.notFound("Doctor profile not found");
        }
        return doctor;
    }

    /**
     * Update doctor profile
     */
    async update(id: string, data: Prisma.DoctorUpdateInput) {
        const doctor = await doctorRepository.findById(id);
        if (!doctor) {
            throw ApiError.notFound("Doctor profile not found");
        }
        return doctorRepository.update(id, data);
    }

    /**
     * Delete doctor profile
     */
    async delete(id: string) {
        const doctor = await doctorRepository.findById(id);
        if (!doctor) {
            throw ApiError.notFound("Doctor profile not found");
        }
        await doctorRepository.delete(id);
        return { message: "Doctor profile deleted successfully" };
    }
}
