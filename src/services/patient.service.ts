import { PatientRepository } from "../repositories/patient.repository";
import { ApiError } from "../utils/ApiError";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { Prisma } from "@prisma/client";

const patientRepository = new PatientRepository();

export class PatientService {
    /**
     * Create a new patient
     */
    async create(data: Prisma.PatientCreateInput) {
        return patientRepository.create(data);
    }

    /**
     * Get all patients
     */
    async getAll(params: {
        page: number;
        limit: number;
        search?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) {
        return patientRepository.findAll(params);
    }

    /**
     * Get patient by ID
     */
    async getById(id: string) {
        const patient = await patientRepository.findById(id);
        if (!patient) {
            throw ApiError.notFound("Patient not found");
        }
        return patient;
    }

    /**
     * Update patient
     */
    async update(id: string, data: Prisma.PatientUpdateInput) {
        const patient = await patientRepository.findById(id);
        if (!patient) {
            throw ApiError.notFound("Patient not found");
        }
        return patientRepository.update(id, data);
    }

    /**
     * Upload patient image
     */
    async uploadImage(id: string, file: Express.Multer.File) {
        const patient = await patientRepository.findById(id);
        if (!patient) {
            throw ApiError.notFound("Patient not found");
        }

        const result = await uploadToCloudinary(file.buffer, "patients");
        return patientRepository.update(id, { imageUrl: result.url });
    }

    /**
     * Delete patient
     */
    async delete(id: string) {
        const patient = await patientRepository.findById(id);
        if (!patient) {
            throw ApiError.notFound("Patient not found");
        }
        await patientRepository.delete(id);
        return { message: "Patient deleted successfully" };
    }
}
