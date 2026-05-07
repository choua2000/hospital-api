import { Router } from "express";
import { MedicalRecordController } from "../controllers/medicalRecord.controller";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { createMedicalRecordSchema, updateMedicalRecordSchema } from "../validators/schemas";

const router = Router();

router.use(authenticate);

router.post("/", authorize("ADMIN", "DOCTOR"), validate(createMedicalRecordSchema), MedicalRecordController.create);
router.get("/", MedicalRecordController.getAll);
router.get("/:id", MedicalRecordController.getById);
router.put("/:id", authorize("ADMIN", "DOCTOR"), validate(updateMedicalRecordSchema), MedicalRecordController.update);
router.post("/:id/file", authorize("ADMIN", "DOCTOR"), upload.single("file"), MedicalRecordController.uploadFile);
router.delete("/:id", authorize("ADMIN"), MedicalRecordController.delete);

export default router;
