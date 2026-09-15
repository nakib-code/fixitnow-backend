import { Router } from "express";

import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { CategoryController } from "./category.controller";
import { upload } from "../../middleware/upload";

const router = Router();

router.post(
  "/",
  auth(Role.ADMIN),
  upload.single("icon"),
  CategoryController.createCategory
);

router.get(
  "/",
  CategoryController.getCategories
);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  upload.single("icon"),
  CategoryController.updateCategory
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;