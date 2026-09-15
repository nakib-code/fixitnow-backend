import { Router } from "express";

import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// ==============================
// Update Profile Information
// ==============================

router.patch(
  "/profile",
  auth(),
  userController.updateUserProfile,
);

// ==============================
// Update Profile Image
// ==============================

router.patch(
  "/profile/image",
  auth(),
  upload.single("profileImg"),
  userController.updateProfileImage,
);

// ==============================
// Admin User Management
// ==============================

// Get all users
router.get(
  "/",
  auth(Role.ADMIN),
  userController.getAllUsers,
);

// Block user
router.patch(
  "/:id/block",
  auth(Role.ADMIN),
  userController.blockUser,
);

// Unblock user
router.patch(
  "/:id/unblock",
  auth(Role.ADMIN),
  userController.unblockUser,
);

// Delete user
router.delete(
  "/:id",
  auth(Role.ADMIN),
  userController.deleteUser,
);

export const userRouter = router;