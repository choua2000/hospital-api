import { Router } from "express";
import { PatientController } from "../controllers/patient.controller";
import { authenticate } from "../middlewares/auth";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { createPatientSchema, updatePatientSchema } from "../validators/schemas";

const router = Router();

router.use(authenticate);

router.post("/", validate(createPatientSchema), PatientController.create);
router.get("/", PatientController.getAll);
router.get("/me", PatientController.getMe);
router.get("/:id", PatientController.getById);
router.put("/:id", validate(updatePatientSchema), PatientController.update);
router.post("/:id/image", upload.single("image"), PatientController.uploadImage);
router.delete("/:id", PatientController.delete);

export default router;
