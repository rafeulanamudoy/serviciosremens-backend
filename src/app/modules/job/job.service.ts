import { assignJobs, JobStutus } from "@prisma/client";
import searchAndPaginate from "../../../helpers/searchAndPaginate";
import prisma from "../../../shared/prisma";
import Api from "twilio/lib/rest/Api";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";

const getTechnicionJob = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  searchQuery: string = "",
  status: string
) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  let additionalFilter: any = {
    technicionId: userId,
  };

  if (status === "current") {
    additionalFilter.job = {
      acceptTechnicionId: userId,
      status: JobStutus.ACCEPT,
      scheduleTime: {
        gte: todayStart,
        lte: todayEnd,
      },
    };
  } else if (status === "incoming") {
    additionalFilter = {
      status: JobStutus.PENDING,
    };
  } else if (status === "upcoming") {
    additionalFilter.job = {
      scheduleTime: {
        gt: todayEnd,
      },
    };
  } else if (status === "complete") {
    additionalFilter.job = {
      status: JobStutus.COMPLETE,
    };
  } else if (status === "decline") {
    additionalFilter = {
      status: JobStutus.DECLINE,
    };
  } else if (status === "pending") {
    additionalFilter = {
      status: JobStutus.DECLINE,
    };
  }
  const data = await searchAndPaginate<assignJobs>(
    prisma.assignJobs,
    [],
    page,
    limit,
    searchQuery,
    additionalFilter,
    {
      select: {
        id: true,
        job: {
          select: {
            id: true,
            customerName: true,

            serviceName: true,
            location: true,
            scheduleTime: true,
            status: true,
            description: true,
          },
        },
        technicion: {
          select: {
            fullName: true,
            id: true,
          },
        },
      },
    }
  );

  return data;
};
const updateAssignJobStatus = async (
  status: JobStutus,
  id: string,
  technicionId: string
) => {
  try {
    let result;

    if (status === JobStutus.ACCEPT) {
      const isAccept = await prisma.assignJobs.findUnique({
        where: {
          id: id,
        },
        include: {
          job: true,
        },
      });
      if (isAccept?.job.status === JobStutus.ACCEPT) {
        throw new ApiError(
          httpStatus.NOT_ACCEPTABLE,
          "this job is already accpeted by another technicion"
        );
      } else if (isAccept?.expireAt && new Date() > isAccept.expireAt) {
        throw new ApiError(
          httpStatus.NOT_ACCEPTABLE,
          "your job is expired .you cannot accept now"
        );
      }

      const result = await prisma.assignJobs.update({
        where: {
          id: id,
        },
        data: {
          status: status,
          job: {
            update: {
              status: status,
              acceptTechnicionId: technicionId,
            },
          },
        },
      });
      return result;
    } else if (status === JobStutus.DECLINE) {
      result = await prisma.assignJobs.update({
        where: {
          id: id,
        },
        data: {
          status: status,
        },
      });
    }
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new ApiError(httpStatus.NOT_FOUND, "job not found");
    }
    throw error;
  }
};

const removedeclineJobs = async (jobId: string) => {
  const result = await prisma.assignJobs.deleteMany({
    where: {
      jobId: jobId,
      status: {
        in: [JobStutus.CANCELLED, JobStutus.PENDING],
      },
    },
  });
  return result;
};

// const technicionHistory = async (
//   page: number = 1,
//   limit: number = 10,
//   searchQuery: string = "",
//   status: string
// ) => {
//   const additionalFilter = {};
//   const result = await searchAndPaginate<assignJobs>(
//     prisma.assignJobs,
//     [],
//     page,
//     limit,
//     searchQuery,
//     additionalFilter
//   );
// };

const getIncomingJob = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  searchQuery: string = ""
) => {
  const additionalFilter: any = {
    technicionId: userId,
    status: JobStutus.PENDING,
  };
  const data = await searchAndPaginate<assignJobs>(
    prisma.assignJobs,
    [],
    page,
    limit,
    searchQuery,
    additionalFilter,
    {
      select: {
        id: true,
        job: {
          select: {
            id: true,
            customerName: true,

            serviceName: true,
            location: true,
            scheduleTime: true,
            status: true,
            description: true,
          },
        },
        technicion: {
          select: {
            fullName: true,
            id: true,
          },
        },
      },
    }
  );

  return data;
};

export const jobService = {
  getTechnicionJob,
  removedeclineJobs,
  updateAssignJobStatus,
  getIncomingJob,
};
