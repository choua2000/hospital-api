import { MedicalRecordRepository } from "../repositories/medicalRecord.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { PatientRepository } from "../repositories/patient.repository";
import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { Prisma } from "@prisma/client";

const medicalRecordRepository = new MedicalRecordRepository();
const doctorRepository = new DoctorRepository();
const patientRepository = new PatientRepository();
const userRepository = new UserRepository();

export class MedicalRecordService {
    async create(data: any) {
        // Validate patient existence
        const patient = await patientRepository.findById(data.patientId);
        if (!patient) {
            throw ApiError.notFound(`Patient with ID ${data.patientId} not found`);
        }

        // Validate doctor existence
        // If doctorId is provided, check if it's a doctor ID or a user ID
        let doctor = await doctorRepository.findById(data.doctorId);

        if (!doctor) {
            // Try searching by userId in case the user passed a user ID instead of doctor ID
            doctor = await doctorRepository.findByUserId(data.doctorId);
            if (doctor) {
                data.doctorId = doctor.id;
            } else {
                // Final check: does the user exist at all?
                const user = await userRepository.findById(data.doctorId);
                if (user) {
                    throw ApiError.notFound(`User ${user.name} exists but does not have a Doctor profile. Please create a doctor profile first.`);
                }
                throw ApiError.notFound(`Doctor or User with ID ${data.doctorId} not found`);
            }
        }

        return medicalRecordRepository.create(data);
    }

    async getAll(params: {
        page: number;
        limit: number;
        patientId?: string;
        doctorId?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) {
        return medicalRecordRepository.findAll(params);
    }

    async getById(id: string) {
        const record = await medicalRecordRepository.findById(id);
        if (!record) {
            throw ApiError.notFound("Medical record not found");
        }
        return record;
    }

    async update(id: string, data: any) {
        const record = await medicalRecordRepository.findById(id);
        if (!record) {
            throw ApiError.notFound("Medical record not found");
        }

        if (data.patientId) {
            const patient = await patientRepository.findById(data.patientId);
            if (!patient) {
                throw ApiError.notFound(`Patient with ID ${data.patientId} not found`);
            }
        }

        if (data.doctorId) {
            let doctor = await doctorRepository.findById(data.doctorId);
            if (!doctor) {
                doctor = await doctorRepository.findByUserId(data.doctorId);
                if (doctor) {
                    data.doctorId = doctor.id;
                } else {
                    const user = await userRepository.findById(data.doctorId);
                    if (user) {
                        throw ApiError.notFound(`User ${user.name} exists but does not have a Doctor profile.`);
                    }
                    throw ApiError.notFound(`Doctor or User with ID ${data.doctorId} not found`);
                }
            }
        }

        return medicalRecordRepository.update(id, data);
    }

    async uploadFile(id: string, file: Express.Multer.File) {
        const record = await medicalRecordRepository.findById(id);
        if (!record) {
            throw ApiError.notFound("Medical record not found");
        }

        const result = await uploadToCloudinary(file.buffer, "medical-records");
        return medicalRecordRepository.update(id, { fileUrl: result.url });
    }

    async delete(id: string) {
        const record = await medicalRecordRepository.findById(id);
        if (!record) {
            throw ApiError.notFound("Medical record not found");
        }
        await medicalRecordRepository.delete(id);
        return { message: "Medical record deleted successfully" };
    }
}
