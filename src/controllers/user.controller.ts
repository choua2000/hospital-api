import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { apiResponse } from "../utils/apiResponse";

const userService = new UserService();

export class UserController {
    /**
     * Get all users
     */
    static getAll = asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query;
        const result = await userService.getAll({
            page: Number(page),
            limit: Number(limit),
            search: search as string,
            sortBy: sortBy as string,
            sortOrder: sortOrder as "asc" | "desc",
        });
        return apiResponse.success(res, "Users retrieved successfully", result);
    });

    /**
     * Get user by ID
     */
    static getById = asyncHandler(async (req: Request, res: Response) => {
        const user = await userService.getById(req.params.id as string);
        return apiResponse.success(res, "User retrieved successfully", user);
    });

    /**
     * Update user
     */
    static update = asyncHandler(async (req: Request, res: Response) => {
        const user = await userService.update(req.params.id as string, req.body);
        return apiResponse.success(res, "User updated successfully", user);
    });

    /**
     * Upload profile image
     */
    static uploadImage = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            return apiResponse.error(res, "Please provide an image file", 400);
        }
        const user = await userService.uploadImage(req.params.id as string, req.file);
        return apiResponse.success(res, "Profile image uploaded successfully", user);
    });

    /**
     * Delete user
     */
    static delete = asyncHandler(async (req: Request, res: Response) => {
        const result = await userService.delete(req.params.id as string);
        return apiResponse.success(res, result.message);
    });
}
