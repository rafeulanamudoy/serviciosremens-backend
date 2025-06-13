import { NextFunction, Request, Response } from "express";

import config from "../../config";
import { Secret } from "jsonwebtoken";

import httpStatus from "http-status";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import ApiError from "../../errors/ApiErrors";
import prisma from "../../shared/prisma";

const verifyOtpToken = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, " verify token needed");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.otpSecret.verify_otp_secret as Secret
      );

      const existingUser = await prisma.user.findUnique({
        where: { id: verifiedUser.id },
      });

      if (!existingUser) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found!");
      }
      req.user = verifiedUser;
      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Forbidden! You are not authorized"
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default verifyOtpToken;
