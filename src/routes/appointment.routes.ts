import { Router } from "express";
import { AppointmentController } from "../controllers/appointment.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createAppointmentSchema, updateAppointmentSchema } from "../validators/schemas";

const router = Router();

router.use(authenticate);

router.post("/", validate(createAppointmentSchema), AppointmentController.create);
router.get("/", AppointmentController.getAll);
router.get("/:id", AppointmentController.getById);
router.put("/:id", validate(updateAppointmentSchema), AppointmentController.update);
router.delete("/:id", AppointmentController.delete);

export default router;
