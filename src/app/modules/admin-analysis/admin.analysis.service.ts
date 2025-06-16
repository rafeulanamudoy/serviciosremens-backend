import { promise } from "zod";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import prisma from "../../../shared/prisma";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { ConnectionCheckOutStartedEvent } from "mongodb";
import searchAndPaginate from "../../../helpers/searchAndPaginate";
import { jobCreate, JobStutus, rating, User, UserStatus } from "@prisma/client";
import eventEmitter from "../../../sse/eventEmitter";
import { assignJobQueue } from "../../../helpers/redis";

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
  const [isJob, technicions] = await Promise.all([
    prisma.jobCreate.findUnique({
      where: {
        id: payload.jobId,
      },
    }),
    prisma.user.findMany({
      where: {
        id: {
          in: payload.technicionId,
        },
      },
    }),
  ]);

  if (!isJob || technicions.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Job or Technicians not found");
  }

  const data = await prisma.assignJobs.createMany({
    data: payload.technicionId.map((technicionId: string) => ({
      jobId: payload.jobId,
      technicionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  });

  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const jobDate = new Date(isJob.scheduleTime);
  jobDate.setHours(0, 0, 0, 0);

  let status = date.getTime() === jobDate.getTime() ? "current" : "upcoming";

  payload.technicionId.forEach((id: string) => {
    eventEmitter.emit("event:technicion-job", {
      userId: id,
      status,
    });
  });
  await assignJobQueue.add(
    "assign-job",
    {
      jobId: payload.jobId,
      technicionIds: payload.technicionId,
    },
    {
      jobId: `assign-delay-${payload.jobId}`,
      delay: 1000 * 60 * 1,
      removeOnComplete: true,
      removeOnFail: true,
    },
    
 
  );
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
      job: {
        select: {
          serviceName: true,
        },
      },
    }
  );

  return tecnicion;
};

const getAllJobs = async (
  page: number = 1,
  limit: number = 10,
  searchQuery: string = ""
) => {
  const additionalFilter = {};

  const jobs = await searchAndPaginate<jobCreate>(
    prisma.jobCreate,
    [],
    page,
    limit,
    searchQuery,
    additionalFilter
  );
  return jobs;
};
export const adminAnalysisService = {
  adminLogin,
  createJob,
  assignJob,
  getAllTecnicion,
  updateTechnicionStatus,
  getFeedBack,
  getAllJobs,
};
