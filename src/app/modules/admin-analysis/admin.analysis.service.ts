import { promise } from "zod";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import prisma from "../../../shared/prisma";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { ConnectionCheckOutStartedEvent } from "mongodb";
import searchAndPaginate from "../../../helpers/searchAndPaginate";
import { rating, User, UserStatus } from "@prisma/client";
const adminLogin = async (payload: any) => {
  const user = await prisma.admin.findUnique({
    where: {
      email: payload.email.toLowerCase(),
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(
    payload.password.trim() as string,
    user?.password?.trim() as string
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }
  const accessToken = jwtHelpers.generateToken(
    user,
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );
  const { password, createdAt, updatedAt, ...userInfo } = user;

  return {
    accessToken,
  };
};
const createJob = async (payload: any) => {
  const data = await prisma.jobCreate.create({
    data: {
      ...payload,
    },
  });
  return data;
};

const assignJob = async (payload: any) => {
  const [isJob, isTechnicion] = await Promise.all([
    await prisma.jobCreate.findUnique({
      where: {
        id: payload.jobId,
      },
    }),
    await prisma.user.findUnique({
      where: {
        id: payload.technicionId,
      },
    }),
  ]);
  if (!isJob || !isTechnicion) {
    throw new ApiError(httpStatus.NOT_FOUND, "job or tecnicion not found");
  }
  const data = await prisma.assignJobs.create({
    data: {
      ...payload,
    },
  });
  return data;
};

const getAllTecnicion = async (
  page: number = 1,
  limit: number = 10,
  searchQuery: string = ""
) => {
  const additionalFilter = {};
  const tecnicion = await searchAndPaginate<User>(
    prisma.user,
    [],
    page,
    limit,
    searchQuery,
    additionalFilter,
    {
      fullName: true,
      email: true,
      rank: true,
      totalJobComplete: true,
      technicionAvailability: true,
      averageRating: true,
      jobCompletationRate: true,
      jobRejection: true,
    }
  );

  return tecnicion;
};

const updateTechnicionStatus = async (userId: string, status: UserStatus) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });
    return updatedUser;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    throw error;
  }
};

const getFeedBack = async (
  page: number = 1,
  limit: number = 10,
  searchQuery: string = ""
) => {
  const additionalFilter = {};
  const tecnicion = await searchAndPaginate<rating>(
    prisma.rating,
    [],
    page,
    limit,
    searchQuery,
    additionalFilter,
    {
      name: true,
      rating: true,
      comment: true,

      technicion: {
        select: {
          fullName: true,
        },
      },
      job:{
        select:{
          serviceName:true
        }
      }
    }
  );

  return tecnicion;
};
export const adminAnalysisService = {
  adminLogin,
  createJob,
  assignJob,
  getAllTecnicion,
  updateTechnicionStatus,
  getFeedBack,
};
