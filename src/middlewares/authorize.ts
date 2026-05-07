// ============================================
// Role-Based Authorization Middleware
// Restricts access based on user roles
// ============================================

import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { ApiError } from "../utils/ApiError";

/**
 * Middleware factory that restricts access to specific roles
 * @param roles - Array of allowed roles
 * @returns Express middleware function
 * 
 * Usage: authorize("ADMIN", "DOCTOR")
 */
export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            next(ApiError.unauthorized("Authentication required"));
            return;
        }

        if (!roles.includes(req.user.role)) {
            next(
                ApiError.forbidden(
                    `Role '${req.user.role}' is not authorized to access this resource`
                )
            );
            return;
        }

        next();
    };
};
