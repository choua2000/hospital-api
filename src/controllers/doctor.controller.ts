import { Request, Response } from "express";
import { DoctorService } from "../services/doctor.service";
import { asyncHandler } from "../utils/asyncHandler";
import { apiResponse } from "../utils/apiResponse";

const doctorService = new DoctorService();

export class DoctorController {
    static create = asyncHandler(async (req: Request, res: Response) => {
        const doctor = await doctorService.create(req.body);
        return apiResponse.success(res, "Doctor profile created successfully", doctor, 201);
    });

    static getAll = asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 10, search, specialization, sortBy, sortOrder } = req.query;
        const result = await doctorService.getAll({
            page: Number(page),
            limit: Number(limit),
            search: search as string,
            specialization: specialization as string,
            sortBy: sortBy as string,
            sortOrder: sortOrder as "asc" | "desc",
        });
        return apiResponse.success(res, "Doctors retrieved successfully", result);
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const doctor = await doctorService.getById(req.params.id as string);
        return apiResponse.success(res, "Doctor retrieved successfully", doctor);
    });

    static update = asyncHandler(async (req: Request, res: Response) => {
        const doctor = await doctorService.update(req.params.id as string, req.body);
        return apiResponse.success(res, "Doctor profile updated successfully", doctor);
    });

    static delete = asyncHandler(async (req: Request, res: Response) => {
        const result = await doctorService.delete(req.params.id as string);
        return apiResponse.success(res, result.message);
    });
}
