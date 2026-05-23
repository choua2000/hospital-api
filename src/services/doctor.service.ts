import { DoctorRepository } from "../repositories/doctor.repository";
import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/ApiError";
import { Prisma } from "@prisma/client";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload";

const doctorRepository = new DoctorRepository();
const userRepository = new UserRepository();


export class DoctorService {
    async create(data: any) {
        const { userId, imageUrl, ...rest } = data;

        // Check if user exists
        const user = await userRepository.findById(userId);
        if (!user) {
            throw ApiError.notFound("User not found");
        }

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

        const doctor = await doctorRepository.create(doctorData);
        if (imageUrl) {
            await userRepository.update(userId, { imageUrl });
        }

        return doctor;
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
    async update(id: string, data: any) {
        const { imageUrl, ...rest } = data;
        const doctor = await doctorRepository.findById(id);
        if (!doctor) {
            throw ApiError.notFound("Doctor profile not found");
        }

        const updatedDoctor = await doctorRepository.update(id, rest as Prisma.DoctorUpdateInput);
        if (imageUrl !== undefined) {
            await userRepository.update(doctor.userId, { imageUrl });
        }

        return updatedDoctor;
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

    /**
     * Upload doctor profile image (updates the associated User)
     */
    async uploadImage(id: string, file: Express.Multer.File) {
        const doctor = await doctorRepository.findById(id);
        if (!doctor) {
            throw ApiError.notFound("Doctor profile not found");
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.buffer, "doctors");

        // Update the associated User with the image URL
        await userRepository.update(doctor.userId, { imageUrl: result.url });

        // Return updated doctor
        return doctorRepository.findById(id);
    }

    /**
     * Delete doctor profile image
     */
    async deleteImage(id: string) {
        const doctor = await doctorRepository.findById(id);
        if (!doctor) {
            throw ApiError.notFound("Doctor profile not found");
        }

        const user = await userRepository.findById(doctor.userId);
        if (!user || !user.imageUrl) {
            throw ApiError.notFound("No image found for this doctor");
        }

        // Try to extract public ID from Cloudinary URL and delete it
        try {
            const urlParts = user.imageUrl.split("/");
            const filename = urlParts.pop()?.split(".")[0];
            const folder = urlParts.pop();
            const parentFolder = urlParts.pop();
            
            if (filename && folder && parentFolder) {
                const publicId = `${parentFolder}/${folder}/${filename}`;
                await deleteFromCloudinary(publicId);
            }
        } catch (error) {
            console.error("Failed to delete image from Cloudinary", error);
        }

        // Update the user to remove the image URL
        await userRepository.update(doctor.userId, { imageUrl: null });

        // Return updated doctor
        return doctorRepository.findById(id);
    }
}

