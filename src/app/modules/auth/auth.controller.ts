import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { authService } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";
import sendOtpToUserNumber from "../../../helpers/phone.number.otp";
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


const adminLoginIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.adminLoginIntoDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin successfully logged in",
    data: result,
  });
});

const sendOtpToUserPhoneNumber = catchAsync(
  async (req: Request, res: Response) => {
    const phoneNumber = req.user.phoneNumber as string;

    const otp = await sendOtpToUserNumber(phoneNumber);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Resend Code successfully",
      data: otp,
    });
  }
);
const socialLoginIntoDb = catchAsync(async (req: Request, res: Response) => {
 
  const result = await authService.socialLoginIntoDb(req.body);
 

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "",
    data: result,
  });
});


export const authController = {
  loginUser,
 

  sendOtpToUserPhoneNumber,


  adminLoginIntoDB,
  socialLoginIntoDb

};
