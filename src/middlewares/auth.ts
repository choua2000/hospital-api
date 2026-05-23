// ============================================
// JWT Authentication Middleware
// Protects routes by verifying JWT tokens
// ============================================

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import prisma from "../config/database";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
                name: string;
            };
        }
    }
}

// Keep AuthRequest alias for complete compatibility
export type AuthRequest = Request;

interface JwtPayload {
    id: string;
    email: string;
    role: string;
    name: string;
}

/**
 * Middleware to authenticate JWT token from Authorization header
 * Attaches decoded user info to req.user
 */
export const authenticate = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Extract token from header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw ApiError.unauthorized("Access token is required");
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        // Verify user still exists and is active
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true, name: true, isActive: true },
        });

        if (!user) {
            throw ApiError.unauthorized("User no longer exists");
        }

        if (!user.isActive) {
            throw ApiError.forbidden("Account has been deactivated");
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
            return;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            next(ApiError.unauthorized("Invalid or expired token"));
            return;
        }
        next(error);
    }
};
