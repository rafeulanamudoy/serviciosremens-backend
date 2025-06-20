import { User } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import bcrypt from "bcryptjs"

const createUser = async (payload: User) => {
   const hashedPassword = await bcrypt.hash(payload.password as string, 10);
  try {
    const result = await prisma.user.create({
      data: {
        email: payload.email.toLowerCase(),
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber,
        password: hashedPassword,
        fcmToken: payload.fcmToken,
        city: payload.city,
        country: payload.country,
        postalCode: payload.postalCode,
        expertise: payload.expertise,
        doc: payload.doc,
      },
    });
    return result;
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Email or phone number already exists"
      );
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

export const userService = {
  createUser,
};
