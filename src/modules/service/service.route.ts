import { Router } from "express";

import { Role } from "../../../generated/prisma/enums";

import auth from "../../middleware/auth";
import { upload } from "../../middleware/upload";

import { ServiceController } from "./service.controller";

const router = Router();

router.get(
  "/",
  ServiceController.getServices
);

router.get(
  "/my-services",
  auth(Role.TECHNICIAN),
  ServiceController.getMyServices
);

router.post(
  "/",
  auth(Role.TECHNICIAN),
  upload.single("image"),
  ServiceController.createService
);

router.patch(
  "/:id",
  auth(Role.TECHNICIAN),
  upload.single("image"),
  ServiceController.updateService
);

router.delete(
  "/:id",
  auth(Role.TECHNICIAN),
  ServiceController.deleteService
);

router.get(
  "/:id",
  ServiceController.getSingleService
);

export const ServiceRoutes = router;