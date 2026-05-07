import { AppointmentRepository } from "../repositories/appointment.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { PatientRepository } from "../repositories/patient.repository";
import { ApiError } from "../utils/ApiError";
import { Prisma } from "@prisma/client";

const appointmentRepository = new AppointmentRepository();
const doctorRepository = new DoctorRepository();
const patientRepository = new PatientRepository();

export class AppointmentService {
    async create(data: any) {
        // Validate patient existence
        const patient = await patientRepository.findById(data.patientId);
        if (!patient) {
            throw ApiError.notFound(`Patient with ID ${data.patientId} not found`);
        }

        // Validate doctor existence and availability
        let doctor = await doctorRepository.findById(data.doctorId);
        if (!doctor) {
            doctor = await doctorRepository.findByUserId(data.doctorId);
            if (doctor) {
                data.doctorId = doctor.id;
            } else {
                throw ApiError.notFound(`Doctor with ID ${data.doctorId} not found`);
            }
        }

        if (!doctor.isAvailable) {
            throw ApiError.badRequest(`Doctor ${doctor.user.name} is currently not available`);
        }

        return appointmentRepository.create(data);
    }

    async getAll(params: {
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
        return appointmentRepository.findAll(params);
    }

    async getById(id: string) {
        const appointment = await appointmentRepository.findById(id);
        if (!appointment) {
            throw ApiError.notFound("Appointment not found");
        }
        return appointment;
    }

    async update(id: string, data: any) {
        const appointment = await appointmentRepository.findById(id);
        if (!appointment) {
            throw ApiError.notFound("Appointment not found");
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
                    throw ApiError.notFound(`Doctor with ID ${data.doctorId} not found`);
                }
            }
            
            if (doctor && !doctor.isAvailable && data.status !== "CANCELLED") {
                 throw ApiError.badRequest(`Doctor ${doctor.user.name} is currently not available`);
            }
        }

        return appointmentRepository.update(id, data);
    }

    async delete(id: string) {
        const appointment = await appointmentRepository.findById(id);
        if (!appointment) {
            throw ApiError.notFound("Appointment not found");
        }
        await appointmentRepository.delete(id);
        return { message: "Appointment deleted successfully" };
    }
}
