import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { paymentController } from "./payment.controller";
const router = Router();

router.get(
  "/passenger-payment-history",
  auth(UserRole.PASSANGER),
  paymentController.passengerPaymentHistory
);

router.get(
  "/driver-payment-history",
  auth(UserRole.DRIVER),
  paymentController.driverPaymentHistory
);
router.post(
  "/withdraw",
  auth(UserRole.DRIVER),
  paymentController.withdrawMoney
);

router.post(
  "/kkiapay-payment-intent",
  auth(UserRole.PASSANGER),
  paymentController.kkiapayInitiatePayment
);

export const paymentRoute = router;
