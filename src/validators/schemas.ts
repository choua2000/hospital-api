// ============================================
// Zod Validation Schemas
// Input validation for all API endpoints
// ============================================

import { z } from "zod";

// ============================================
// Auth Schemas
// ============================================
export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(64),
    role: z.enum(["ADMIN", "DOCTOR", "NURSE", "USER", "PATIENT"]).optional(),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const customerLoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const verifyOtpSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d{6}$/, "OTP must contain only digits"),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters").max(64),
});

// ============================================
// User Schemas  
// ============================================
export const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]).optional(),
    isActive: z.boolean().optional(),
});

// ============================================
// Patient Schemas
// ============================================
export const createPatientSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    phone: z.string().min(7, "Phone must be at least 7 characters"),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
    bloodType: z.string().optional(),
    allergies: z.string().optional(),
});

export const updatePatientSchema = z.object({
    name: z.string().min(2).optional(),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date").optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    phone: z.string().min(7).optional(),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
    bloodType: z.string().optional(),
    allergies: z.string().optional(),
});

// ============================================
// Doctor Schemas
// ============================================
export const createDoctorSchema = z.object({
    userId: z.string().uuid("Invalid user ID"),
    specialization: z.string().min(2, "Specialization is required"),
    phone: z.string().optional(),
    schedule: z.any().optional(),
    bio: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal("")),
});

export const updateDoctorSchema = z.object({
    specialization: z.string().min(2).optional(),
    phone: z.string().optional(),
    schedule: z.any().optional(),
    bio: z.string().optional(),
    isAvailable: z.boolean().optional(),
    imageUrl: z.string().url().optional().or(z.literal("")),
});

// ============================================
// Appointment Schemas
// ============================================
export const createAppointmentSchema = z.object({
    patientId: z.string().uuid("Invalid patient ID"),
    doctorId: z.string().uuid("Invalid doctor ID"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date").optional(),
    reason: z.string().optional(),
    notes: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
    status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date").optional(),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date").optional(),
    reason: z.string().optional(),
    notes: z.string().optional(),
});

// ============================================
// Medical Record Schemas
// ============================================
export const createMedicalRecordSchema = z.object({
    patientId: z.string().uuid("Invalid patient ID"),
    doctorId: z.string().uuid("Invalid doctor ID"),
    diagnosis: z.string().min(1, "Diagnosis is required"),
    prescription: z.string().optional(),
    notes: z.string().optional(),
});

export const updateMedicalRecordSchema = z.object({
    diagnosis: z.string().min(1).optional(),
    prescription: z.string().optional(),
    notes: z.string().optional(),
});

// ============================================
// Billing Schemas
// ============================================
export const createBillSchema = z.object({
    patientId: z.string().uuid("Invalid patient ID"),
    totalAmount: z.number().positive("Total amount must be positive"),
    description: z.string().optional(),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date").optional(),
    items: z
        .array(
            z.object({
                description: z.string().min(1, "Item description is required"),
                amount: z.number().positive("Amount must be positive"),
                quantity: z.number().int().positive().optional(),
            })
        )
        .optional(),
});

export const updateBillSchema = z.object({
    totalAmount: z.number().positive().optional(),
    paidAmount: z.number().min(0).optional(),
    status: z.enum(["UNPAID", "PARTIAL", "PAID", "REFUNDED"]).optional(),
    description: z.string().optional(),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date").optional(),
});

// ============================================
// Query Params Schema (for pagination)
// ============================================
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
