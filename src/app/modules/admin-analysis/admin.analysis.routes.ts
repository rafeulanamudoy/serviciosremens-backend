import express from "express";

import { adminAnalysisController } from "./admin.analysis.controller";
import { adminValidation } from "./admin.analysis.validation";
import validateRequest from "../../middlewares/validateRequest";

import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();
router.post("/admin-login", adminAnalysisController.adminLogin);
router.post(
  "/create-job",
  auth(UserRole.ADMIN),
  validateRequest(adminValidation.jobCreateSchema),
  adminAnalysisController.createJob
);
router.post(
  "/assign-job",
  auth(UserRole.ADMIN),
  validateRequest(adminValidation.assignJob),
  adminAnalysisController.asssignJob
);
router.get(
  "/all-technicion",
  auth(UserRole.ADMIN),

  adminAnalysisController.getAllTecnicion
);
router.patch(
  "/update-status",
  auth(UserRole.ADMIN),
  adminAnalysisController.updateTechnicionStatus
);
router.get(
  "/get-feedback",
  auth(UserRole.ADMIN),
  adminAnalysisController.getFeedBack
);
export const adminRoute = router;
