import express from "express";
import { adminController } from "./admin.analysis.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/revenue-for-owner",
  auth(UserRole.DRIVER),
  adminController.getRevenueForDriver
);

router.get(
  "/total-revenue",
  auth(UserRole.ADMIN),
  adminController.getTotalRevenue
);

router.get(
  "/cancellation-rate",
  auth(UserRole.ADMIN),
  adminController.getCancellationRate
);

router.get(
  "/top-passengers",
  auth(UserRole.ADMIN),
  adminController.getTopPassengers
);

router.get("/top-drivers", auth(UserRole.ADMIN), adminController.getTopDrivers);

router.get("/all-users", auth(UserRole.ADMIN), adminController.getAllUsers);

export const adminRoute = router;
