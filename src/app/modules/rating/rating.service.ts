import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const createRating = async (payload: any) => {
  const [job, technicion] = await Promise.all([
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
  if (!job || !technicion) {
    throw new ApiError(httpStatus.NOT_FOUND, "tecnicion or job not found");
  }

  const newRating = await prisma.rating.create({
    data: {
      ...payload,
    },
  });

  const ratings = await prisma.rating.findMany({
    where: { technicionId: payload.technicionId },
    select: { rating: true },
  });

  const totalRating = ratings.reduce((acc, cur) => acc + cur.rating, 0);
  const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;

  await prisma.user.update({
    where: { id: payload.technicionId },
    data: { averageRating },
  });

  return newRating;
};

export const ratingService = {
  createRating,
};
