import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/authorize";
import { upload } from "../middlewares/upload";
import { validate } from "../middlewares/validate";
import { updateUserSchema } from "../validators/schemas";

const router = Router();

// All routes are protected
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get("/", authorize("ADMIN"), UserController.getAll);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get("/:id", UserController.getById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private
 */
router.put("/:id", validate(updateUserSchema), UserController.update);

/**
 * @route   POST /api/users/:id/image
 * @desc    Upload profile image
 * @access  Private
 */
router.post("/:id/image", upload.single("image"), UserController.uploadImage);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete("/:id", authorize("ADMIN"), UserController.delete);

export default router;
