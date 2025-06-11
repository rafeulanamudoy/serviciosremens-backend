import express from "express";
import { authController } from "./auth.controller";
import validateRequest from "../../middlewares/validateRequest";
import { authValidation } from "./auth.validation";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpers/fileUploader";
import { UserRole } from "@prisma/client";
import signUpVerify from "../../middlewares/signupVerify";
import { localFileUploader } from "../../../helpers/localFileUploader";

const router = express.Router();

router.post(
  "/login",
  validateRequest(authValidation.authLoginSchema),
  authController.loginUser
);
router.post("/social-login", 
  validateRequest(authValidation.authSocialSchema), authController.socialLoginIntoDb);

router.post("/admin-login", authController.adminLoginIntoDB);
router.post(
  "/send-otp",
  signUpVerify(),
  authController.sendOtpToUserPhoneNumber
);


export const authRoute = router;
