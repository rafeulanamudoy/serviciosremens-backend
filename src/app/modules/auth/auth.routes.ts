import express from "express";
import { authController } from "./auth.controller";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpers/fileUploader";
import { UserRole } from "@prisma/client";
import signUpVerify from "../../middlewares/verifyOtpToken";
import { localFileUploader } from "../../../helpers/localFileUploader";

import verifyOtpToken from "../../middlewares/verifyOtpToken";
import resetVerifyToken from "../../middlewares/resetVerify";

const router = express.Router();

router.post(
  "/login",
  validateRequest(authValidation.authLoginSchema),
  authController.loginUser
);
router.post(
  "/social-login",
  validateRequest(authValidation.authSocialSchema),
  authController.socialLoginIntoDb
);



router.post(
  "/forgetpassword-otp-to-gmail",
  authController.forgetPasswordToGmail
);
router.post("/forgetpassword-otp-to-phone",authController.forgetPasswordToPhone)
router.post("/verfiy-otp", verifyOtpToken(), authController.verifyOtp);
router.patch(
  "/reset-password",
  resetVerifyToken(),
  authController.resetPassword
);

export const authRoute = router;
