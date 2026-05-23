// ============================================
// Environment Configuration
// Centralized env variable management
// ============================================

import dotenv from "dotenv";
dotenv.config();

export const env = {
    // Server
    PORT: parseInt(process.env.PORT || "3000", 10),
    NODE_ENV: process.env.NODE_ENV || "development",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || (() => {
        if (process.env.NODE_ENV === "production") throw new Error("JWT_SECRET must be provided in production");
        return "fallback-secret-key";
    })(),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

    // Bcrypt
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || 12,

    // Email (SMTP)
    SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
    SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
    SMTP_USER: process.env.SMTP_USER || "",
    SMTP_PASS: process.env.SMTP_PASS || "",
    SMTP_FROM: process.env.SMTP_FROM || "Hospital Management <noreply@hospital.com>",

    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3030/api/auth/google/callback",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3200",
} as const;
