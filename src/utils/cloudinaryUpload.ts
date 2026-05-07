// ============================================
// Cloudinary Upload Utility
// Handles file uploads to Cloudinary service
// ============================================

import cloudinary from "../config/cloudinary";
import { ApiError } from "./ApiError";

interface UploadResult {
    url: string;
    publicId: string;
}

/**
 * Upload a file buffer to Cloudinary
 * @param fileBuffer - The file buffer to upload
 * @param folder - Cloudinary folder to store the file in
 * @returns Upload result with URL and public ID
 */
export const uploadToCloudinary = (
    fileBuffer: Buffer,
    folder: string
): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `hospital/${folder}`,
                resource_type: "auto",
            },
            (error, result) => {
                if (error) {
                    reject(ApiError.internal(`Cloudinary upload failed: ${error.message}`));
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

/**
 * Delete a file from Cloudinary by public ID
 * @param publicId - The Cloudinary public ID of the file
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Failed to delete from Cloudinary:", error);
    }
};
