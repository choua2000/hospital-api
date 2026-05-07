import { Request, Response } from "express";
import { AppointmentService } from "../services/appointment.service";
import { asyncHandler } from "../utils/asyncHandler";
import { apiResponse } from "../utils/apiResponse";

const appointmentService = new AppointmentService();

export class AppointmentController {
    static create = asyncHandler(async (req: Request, res: Response) => {
        const appointment = await appointmentService.create(req.body);
        return apiResponse.success(res, "Appointment created successfully", appointment, 201);
    });

    static getAll = asyncHandler(async (req: Request, res: Response) => {
        const {
            page = 1,
            limit = 10,
            status,
            doctorId,
            patientId,
            dateFrom,
            dateTo,
            sortBy,
            sortOrder,
        } = req.query;

        const result = await appointmentService.getAll({
            page: Number(page),
            limit: Number(limit),
            status: status as string,
            doctorId: doctorId as string,
            patientId: patientId as string,
            dateFrom: dateFrom as string,
            dateTo: dateTo as string,
            sortBy: sortBy as string,
            sortOrder: sortOrder as "asc" | "desc",
        });
        return apiResponse.success(res, "Appointments retrieved successfully", result);
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const appointment = await appointmentService.getById(req.params.id as string);
        return apiResponse.success(res, "Appointment retrieved successfully", appointment);
    });

    static update = asyncHandler(async (req: Request, res: Response) => {
        const appointment = await appointmentService.update(req.params.id as string, req.body);
        return apiResponse.success(res, "Appointment updated successfully", appointment);
    });

    static delete = asyncHandler(async (req: Request, res: Response) => {
        const result = await appointmentService.delete(req.params.id as string);
        return apiResponse.success(res, result.message);
    });
}
