import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { authService } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";

import { UserRole } from "@prisma/client";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User successfully logged in",
    data: result,
  });
});



const socialLoginIntoDb = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.socialLoginIntoDb(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "social login successfully",
    data: result,
  });
});
const forgetPasswordToGmail = catchAsync(
  async (req: Request, res: Response) => {
    const email = req.body.email as string;
    const response = await authService.forgetPasswordToGmail(email);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "OTP send successfully",
      data: response,
    });
  }
);
 
const forgetPasswordToPhone= catchAsync(async (req: any, res: Response) => {
   const phoneNumber = req.body.phoneNumber as string;
    const response = await authService.forgetPasswordToPhone(phoneNumber);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "OTP send successfully",
      data: response,
    });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  const { otp, reason } = req.body;
  const response = await authService.verifyOtp(otp, userId, reason);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "OTP verify  successfully",
    data: response,
  });
});
const resetPassword = catchAsync(async (req: any, res: Response) => {
  const userId = req.user.id;
  const { newPassword } = req.body;
  const result = await authService.resetPassword(newPassword, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password reset successfully.",
    data: result,
  });
});

export const authController = {
  loginUser,



  socialLoginIntoDb,
  forgetPasswordToGmail,
  verifyOtp,
  resetPassword,
  forgetPasswordToPhone
};
