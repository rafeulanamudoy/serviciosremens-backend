import prisma from "../../../shared/prisma";
import bcrypt from "bcryptjs";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { User, UserRole, UserStatus } from "@prisma/client";

import httpStatus from "http-status";
import { ConnectionCheckOutStartedEvent } from "mongodb";
import generateOTP from "../../../helpers/generateOtp";
import { otpQueueEmail, otpQueuePhone } from "../../../helpers/redis";
import { Secret } from "jsonwebtoken";
import { OtpReason } from "../../../enum/verifyEnum";
interface SocialLoginPayload {
  email: string;
  fullName: string;
  socialLoginType: "GOOGLE";
  fcmToken: string;
  profileImage: string;
  role: UserRole;
}
const loginUserIntoDB = async (payload: any) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email.toLowerCase(),
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // if (user.status === UserStatus.PENDING) {
  //   throw new ApiError(httpStatus.METHOD_NOT_ALLOWED, "verify your otp first");
  // }
  if (user.status === UserStatus.BLOCKED) {
    throw new ApiError(
      httpStatus.METHOD_NOT_ALLOWED,
      "your account is disabled.please contact with admin"
    );
  }

  if (!user.password) {
    throw new ApiError(
      400,
      "User signed up with social login. Please login with Google"
    );
  }
  const isPasswordValid = await bcrypt.compare(
    payload.password,
    user?.password
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  await prisma.user.update({
    where: {
      email: payload.email.toLowerCase(),
    },
    data: {
      fcmToken: payload.fcmToken,
    },
  });
  const accessToken = jwtHelpers.generateToken(
    user,
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );
  const { password, status, createdAt, updatedAt, ...userInfo } = user;

  return {
    accessToken,
 
  };
};

const socialLoginIntoDb = async (payload: SocialLoginPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

 

  if (existingUser) {
    if (existingUser.socialLoginType === payload.socialLoginType) {
      const { password, ...userInfo } = existingUser;
      const accessToken = jwtHelpers.generateToken(
        userInfo,
        config.jwt.jwt_secret as string,
        config.jwt.expires_in as string
      );

      return { accessToken };
    } else {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `You have already signed up using ${existingUser.socialLoginType}. Please continue using the same method.`
      );
    }
  }

  const newUser = await prisma.user.create({
    data: {
      email: payload.email.toLowerCase(),
      fullName: payload.fullName,
      socialLoginType: payload.socialLoginType,
      fcmToken: payload.fcmToken,
      profileImage: payload.profileImage || "",
      role: payload.role,
      status: UserStatus.ACTIVE,
    },
  });

  const { password, ...userInfo } = newUser;
  const accessToken = jwtHelpers.generateToken(
    userInfo,
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  return { accessToken };
};

const forgetPasswordToGmail = async (email: string) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "user not found");
  }
  const otp = generateOTP();
  const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_TIME);
  otpQueueEmail.add(
    "send-otp-to-email",
    {
      email: existingUser.email,
      otpCode: otp,
    },
    {
      jobId: `${existingUser.id}-${Date.now()}`,
      removeOnComplete: true,
      delay: 0,
      backoff: 5000,
      attempts: 3,
      removeOnFail: true,
    }
  );
  await prisma.otp.upsert({
    where: {
      userId: existingUser.id,
    },
    create: {
      userId: existingUser.id,
      expiresAt: expiresAt,
      otpCode: otp,
    },
    update: {
      otpCode: otp,
      expiresAt: expiresAt,
    },
  });

  return jwtHelpers.generateToken(
    { id: existingUser.id },
    config.otpSecret.verify_otp_secret as Secret,
    "5m"
  );
};

const forgetPasswordToPhone = async (phoneNumber: string) => {
  console.log(phoneNumber,"check phone numbewwr")
  const existingUser = await prisma.user.findUnique({
    where: {
      phoneNumber: phoneNumber,
    },
  });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "user not found");
  }
  const otp = generateOTP();
  const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_TIME);
  otpQueuePhone.add(
    "send-otp-to-phone",
    {
      phoneNumber: existingUser.phoneNumber,
      otpCode: otp,
    },
    {
      jobId: `${existingUser.id}-${Date.now()}`,
      removeOnComplete: true,
      delay: 0,
      backoff: 5000,
      attempts: 3,
      removeOnFail: true,
    }
  );
  await prisma.otp.upsert({
    where: {
      userId: existingUser.id,
    },
    create: {
      userId: existingUser.id,
      expiresAt: expiresAt,
      otpCode: otp,
    },
    update: {
      otpCode: otp,
      expiresAt: expiresAt,
    },
  });

  return jwtHelpers.generateToken(
    { id: existingUser.id },
    config.otpSecret.verify_otp_secret as Secret,
    "5m"
  );
};

const verifyOtp = async (otp: string, userId: string, reason: OtpReason) => {

  const existingOtp = await prisma.otp.findUnique({
    where: {
      userId: userId,
    },
  });



  if (existingOtp?.otpCode !== otp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Wrong OTP");
  }

  if (existingOtp.expiresAt && new Date() > existingOtp.expiresAt) {
    await prisma.otp.deleteMany({ where: { userId: userId } });
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Your OTP has expired. Please request a new one."
    );
  }

  await prisma.otp.deleteMany({
    where: {
      userId: userId,
    },
  });
  switch (reason) {
    case OtpReason.RESET_PASSWORD:
      return jwtHelpers.generateToken(
        { id: userId },
        config.otpSecret.reset_password_secret as Secret,
        config.jwt.expires_in as string
      );

    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP reason");
  }
};

const resetPassword = async (newPassword: string, userId: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throw new ApiError(404, "user not found");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.jwt.gen_salt)
  );

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });
  const token = jwtHelpers.generateToken(
    { id: userId },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );
  
  return  token ;
};

export const authService = {
  loginUserIntoDB,

 
  socialLoginIntoDb,
  forgetPasswordToGmail,
  forgetPasswordToPhone,
  verifyOtp,
  resetPassword,
};
