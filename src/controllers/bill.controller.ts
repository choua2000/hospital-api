import { Request, Response } from "express";
import { BillService } from "../services/bill.service";
import { asyncHandler } from "../utils/asyncHandler";
import { apiResponse } from "../utils/apiResponse";

const billService = new BillService();

export class BillController {
    static create = asyncHandler(async (req: Request, res: Response) => {
        const { items, ...billData } = req.body;
        const bill = await billService.create(billData, items);
        return apiResponse.success(res, "Bill created successfully", bill, 201);
    });

    static getAll = asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 10, patientId, status, sortBy, sortOrder } = req.query;
        const result = await billService.getAll({
            page: Number(page),
            limit: Number(limit),
            patientId: patientId as string,
            status: status as string,
            sortBy: sortBy as string,
            sortOrder: sortOrder as "asc" | "desc",
        });
        return apiResponse.success(res, "Bills retrieved successfully", result);
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const bill = await billService.getById(req.params.id as string);
        return apiResponse.success(res, "Bill retrieved successfully", bill);
    });

    static update = asyncHandler(async (req: Request, res: Response) => {
        const bill = await billService.update(req.params.id as string, req.body);
        return apiResponse.success(res, "Bill updated successfully", bill);
    });

    static delete = asyncHandler(async (req: Request, res: Response) => {
        const result = await billService.delete(req.params.id as string);
        return apiResponse.success(res, result.message);
    });
}
