import { Request, Response } from "express";
import { MedicalRecordService } from "../services/medicalRecord.service";
import { asyncHandler } from "../utils/asyncHandler";
import { apiResponse } from "../utils/apiResponse";

const medicalRecordService = new MedicalRecordService();

export class MedicalRecordController {
    static create = asyncHandler(async (req: Request, res: Response) => {
        const record = await medicalRecordService.create(req.body);
        return apiResponse.success(res, "Medical record created successfully", record, 201);
    });

    static getAll = asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 10, patientId, doctorId, search, sortBy, sortOrder } = req.query;
        const result = await medicalRecordService.getAll({
            page: Number(page),
            limit: Number(limit),
            patientId: patientId as string,
            doctorId: doctorId as string,
            search: search as string,
            sortBy: sortBy as string,
            sortOrder: sortOrder as "asc" | "desc",
        });
        return apiResponse.success(res, "Medical records retrieved successfully", result);
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const record = await medicalRecordService.getById(req.params.id as string);
        return apiResponse.success(res, "Medical record retrieved successfully", record);
    });

    static update = asyncHandler(async (req: Request, res: Response) => {
        const record = await medicalRecordService.update(req.params.id as string, req.body);
        return apiResponse.success(res, "Medical record updated successfully", record);
    });

    static uploadFile = asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            return apiResponse.error(res, "Please provide a file", 400);
        }
        const record = await medicalRecordService.uploadFile(req.params.id as string, req.file);
        return apiResponse.success(res, "File uploaded successfully", record);
    });

    static delete = asyncHandler(async (req: Request, res: Response) => {
        const result = await medicalRecordService.delete(req.params.id as string);
        return apiResponse.success(res, result.message);
    });
}
