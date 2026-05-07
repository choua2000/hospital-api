import { Request, Response } from "express";
import { PatientService } from "../services/patient.service";
import { asyncHandler } from "../utils/asyncHandler";
import { apiResponse } from "../utils/apiResponse";

const patientService = new PatientService();

export class PatientController {
    static create = asyncHandler(async (req: Request, res: Response) => {
        const patient = await patientService.create(req.body);
        return apiResponse.success(res, "Patient created successfully", patient, 201);
    });

    static getAll = asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query;
        const result = await patientService.getAll({
            page: Number(page),
            limit: Number(limit),
            search: search as string,
            sortBy: sortBy as string,
            sortOrder: sortOrder as "asc" | "desc",
        });
        return apiResponse.success(res, "Patients retrieved successfully", result);
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const patient = await patientService.getById(req.params.id as string);
        return apiResponse.success(res, "Patient retrieved successfully", patient);
    });

    static update = asyncHandler(async (req: Request, res: Response) => {
        const patient = await patientService.update(req.params.id as string, req.body);
        return apiResponse.success(res, "Patient updated successfully", patient);
    });

    static uploadImage = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            return apiResponse.error(res, "Please provide an image file", 400);
        }
        const patient = await patientService.uploadImage(req.params.id as string, req.file);
        return apiResponse.success(res, "Patient image uploaded successfully", patient);
    });

    static delete = asyncHandler(async (req: Request, res: Response) => {
        const result = await patientService.delete(req.params.id as string);
        return apiResponse.success(res, result.message);
    });
}
