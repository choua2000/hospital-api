// ============================================
// Standardized API Response Helper
// ============================================

import { Response } from "express";

/**
 * Sends a standardized JSON response
 */
export const apiResponse = {
    /**
     * Send a success response
     */
    success: <T>(
        res: Response,
        message: string,
        data: T | null = null,
        statusCode = 200,
        meta?: Record<string, any>
    ): Response => {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            ...(meta && { meta }),
        });
    },

    /**
     * Send an error response (Alternative to throwing ApiError)
     */
    error: (
        res: Response,
        message: string,
        statusCode = 500,
        errors?: any
    ): Response => {
        return res.status(statusCode).json({
            success: false,
            message,
            ...(errors && { errors }),
        });
    },
};
