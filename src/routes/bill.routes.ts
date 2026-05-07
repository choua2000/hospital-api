import { Router } from "express";
import { BillController } from "../controllers/bill.controller";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { createBillSchema, updateBillSchema } from "../validators/schemas";

const router = Router();

router.use(authenticate);

router.post("/", authorize("ADMIN", "RECEPTIONIST"), validate(createBillSchema), BillController.create);
router.get("/", BillController.getAll);
router.get("/:id", BillController.getById);
router.put("/:id", authorize("ADMIN", "RECEPTIONIST"), validate(updateBillSchema), BillController.update);
router.delete("/:id", authorize("ADMIN"), BillController.delete);

export default router;
