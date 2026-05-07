import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { apiResponse } from "../utils/apiResponse";

const authService = new AuthService();

export class AuthController {
    /**
     * Handle user registration
     */
    static register = asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.register(req.body);
        return apiResponse.success(res, "User registered successfully", result, 201);
    });

    /**
     * Handle user login
     */
    static registerAdmin = asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.registerAdmin(req.body);
        return apiResponse.success(res, "Admin registered successfully", result, 201);
    });

    static registerCustomer = asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.registerCustomer(req.body);
        return apiResponse.success(res, "Customer registered successfully", result, 201);
    });

    static loginAdmin = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const result = await authService.loginAdmin(email, password);
        return apiResponse.success(res, "Admin logged in successfully", result);
    });

    static loginCustomer = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const result = await authService.loginCustomer(email, password);
        return apiResponse.success(res, "Customer logged in successfully", result);
    });

    static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        return apiResponse.success(res, "Password reset token generated", result);
    });

    static resetPassword = asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.resetPassword(req.body);
        return apiResponse.success(res, "Password reset successfully", result);
    });

    static login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        return apiResponse.success(res, "Login successful", result);
    });

    /**
     * Get current user profile
     */
    static getMe = asyncHandler(async (req: Request, res: Response) => {
        // @ts-ignore - user is attached by authenticate middleware
        const userId = req.user.id;
        const user = await authService.getMe(userId);
        return apiResponse.success(res, "Profile retrieved successfully", user);
    });
}
