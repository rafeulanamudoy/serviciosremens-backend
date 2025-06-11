import prisma from "../../../shared/prisma";
import bcrypt from "bcryptjs";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { User, UserRole, UserStatus } from "@prisma/client";

import httpStatus from "http-status";
import { ConnectionCheckOutStartedEvent } from "mongodb";
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
    userInfo,
  };
};
const adminLoginIntoDB = async (payload: any) => {
  const { email, password } = payload;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }
  const user = await prisma.admin.findUnique({
    where: {
      email: email,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }
  const { password: _, ...userInfo } = user;
  const accessToken = jwtHelpers.generateToken(
    { ...userInfo, role: UserRole.ADMIN },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );
  return { accessToken };
};
const socialLoginIntoDb = async (payload: SocialLoginPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  console.log(existingUser,"check existing user")


  if (existingUser) {
    if (existingUser.socialLoginType === payload.socialLoginType) {
      const { password, ...userInfo } = existingUser;
      const accessToken = jwtHelpers.generateToken(
        userInfo,
        config.jwt.jwt_secret as string,
        config.jwt.expires_in as string
      );

      return { accessToken, userInfo };
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

  return { accessToken, userInfo };
};













export const authService = {
  loginUserIntoDB,

  adminLoginIntoDB,
  socialLoginIntoDb
 
}