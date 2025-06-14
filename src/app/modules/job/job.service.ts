import { assignJobs } from "@prisma/client";
import searchAndPaginate from "../../../helpers/searchAndPaginate";
import prisma from "../../../shared/prisma";

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

    additionalFilter.scheduleTime = {
      gte: todayStart,
      lte: todayEnd,
    };
  } else if (status === "upcoming") {
      console.log("upcoming")
    additionalFilter.scheduleTime = {
      gt: todayEnd,
    };
  } else {
    additionalFilter.status = status;

    const data = await searchAndPaginate<assignJobs>(
      prisma.assignJobs,
      [],
      page,
      limit,
      searchQuery,
      additionalFilter,
      {
        select: {
          job: {
            select: {
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
              id:true
            },
          },
        },
      }
    );
    console.log(data,"check tecnicion")

    return data;
  }
};

export const jobService = {
  getTechnicionJob,
};
