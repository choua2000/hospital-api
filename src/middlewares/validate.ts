// ============================================
// Zod Validation Middleware
// Validates request body/query/params using Zod schemas
// ============================================

import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Middleware factory that validates request body against a Zod schema
 * @param schema - Zod schema to validate against
 */
export const validate = (schema: ZodSchema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware factory that validates request query params against a Zod schema
 * @param schema - Zod schema to validate against
 */
export const validateQuery = (schema: ZodSchema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            req.query = schema.parse(req.query) as any;
            next();
        } catch (error) {
            next(error);
        }
    };
};
