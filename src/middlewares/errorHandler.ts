// ============================================
// Global Error Handler Middleware
// Catches all errors and returns consistent response
// ============================================

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error(`[ERROR] ${err.message}`, err.stack);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const errors = err.issues.map((e: any) => ({
            field: e.path.join("."),
            message: e.message,
        }));

        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
        return;
    }

    // Handle custom API errors
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    // Handle Prisma known errors
    if (err.constructor.name === "PrismaClientKnownRequestError") {
        const prismaError = err as any;
        switch (prismaError.code) {
            case "P2002":
                res.status(409).json({
                    success: false,
                    message: `Duplicate value for field: ${prismaError.meta?.target}`,
                });
                return;
            case "P2025":
                res.status(404).json({
                    success: false,
                    message: "Record not found",
                });
                return;
            default:
                break;
        }
    }

    // Default: Internal server error
    res.status(500).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "Internal Server Error"
                : err.message,
    });
};
