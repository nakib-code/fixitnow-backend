import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/upload";

const router = Router();


// Update profile information
router.patch(
  "/profile",
  auth(),
  userController.updateUserProfile
);


// Update profile image
router.patch(
  "/profile/image",
  auth(),
  upload.single("profileImg"),
  userController.updateProfileImage
);


export const userRouter = router;