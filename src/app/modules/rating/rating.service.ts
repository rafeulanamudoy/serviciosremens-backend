import prisma from "../../../shared/prisma";

const createRating = async (payload: any) => {

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