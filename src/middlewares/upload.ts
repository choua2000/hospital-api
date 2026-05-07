// ============================================
// Multer Upload Middleware
// Handles file upload via memory storage (for Cloudinary)
// ============================================

import multer from "multer";
import { ApiError } from "../utils/ApiError";

// Use memory storage (files stored as Buffer, then sent to Cloudinary)
const storage = multer.memoryStorage();

// File filter: allow only images and PDFs
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(ApiError.badRequest("Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF are allowed."));
    }
};

/**
 * Multer upload instance
 * - Max file size: 5MB
 * - Allowed types: images + PDF
 */
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
