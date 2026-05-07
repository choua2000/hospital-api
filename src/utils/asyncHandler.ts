// ============================================
// Async Handler Wrapper
// Catches async errors and forwards to Express error handler
// ============================================

import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

/**
 * Wraps async route handlers to automatically catch errors
 * and forward them to Express global error handler
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
