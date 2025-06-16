import { Prisma } from "@prisma/client";

const searchAndPaginate = async <T>(
  model: any,
  searchableFields: (keyof T)[], //example: ['name', 'email']
  page: number = 1,
  limit: number = 10,
  searchQuery: string = "",
  additionalFilter: Prisma.Enumerable<Prisma.JsonObject> = {},
  selectFields?: any
) => {

  const skip = (page - 1) * limit;
  const searchFilter: Prisma.JsonObject = searchQuery
    ? {
        OR: searchableFields.map((field) => ({
          [field]: {
            contains: searchQuery,
            mode: Prisma.QueryMode.insensitive,
          },
        })),
        ...(Array.isArray(additionalFilter)
          ? Object.assign({}, ...additionalFilter)
          : additionalFilter),
      }
    : additionalFilter;

  const data = await model.findMany({
    where: searchFilter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    ...("select" in selectFields || "include" in selectFields
      ? selectFields
      : {}),
  });

  const total = await model.count({
    where: searchFilter,
  });

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
};

export default searchAndPaginate;
