import { Router } from "express";
import { DoctorController } from "../controllers/doctor.controller";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { createDoctorSchema, updateDoctorSchema } from "../validators/schemas";

const router = Router();

router.use(authenticate);

router.post("/", authorize("ADMIN"), validate(createDoctorSchema), DoctorController.create);
router.get("/", DoctorController.getAll);
router.get("/:id", DoctorController.getById);
router.put("/:id", authorize("ADMIN", "DOCTOR"), validate(updateDoctorSchema), DoctorController.update);
router.delete("/:id", authorize("ADMIN"), DoctorController.delete);

export default router;
