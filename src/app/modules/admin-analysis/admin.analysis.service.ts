import { BookingStatus, UserRole } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const getRevenueForDriverService = async (
  driverId: string,
  timeframe: "weekly" | "monthly" | "yearly"
) => {
  if (!driverId) {
    throw new ApiError(404, "driver ID is required.");
  }
  let startDate = new Date();
  let endDate = new Date();

  switch (timeframe) {
    case "weekly":
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);

      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "monthly":
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      break;

    case "yearly":
      startDate = new Date(startDate.getFullYear(), 0, 1);
      endDate = new Date(startDate.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;

    default:
      throw new ApiError(
        404,
        "Invalid timeframe. Use weekly, monthly, or yearly."
      );
  }

  const revenues = await prisma.booking.groupBy({
    by: ["createdAt"],
    _sum: { totalPrice: true },
    where: {
      driverId,
      bookingStatus: BookingStatus.PAST,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const timelineArray: { label: string; revenue: number }[] = [];

  for (const revenue of revenues) {
    const date = new Date(revenue.createdAt as Date);

    if (timeframe === "weekly") {
      const day = date.toLocaleDateString("en-US", { weekday: "short" });
      const existingEntry = timelineArray.find((entry) => entry.label === day);
      if (existingEntry) {
        existingEntry.revenue += revenue._sum.totalPrice || 0;
      } else {
        timelineArray.push({
          label: day,
          revenue: revenue._sum.totalPrice || 0,
        });
      }
    } else if (timeframe === "monthly") {
      const day = date.getDate().toString();
      const existingEntry = timelineArray.find((entry) => entry.label === day);
      if (existingEntry) {
        existingEntry.revenue += revenue._sum.totalPrice || 0;
      } else {
        timelineArray.push({
          label: day,
          revenue: revenue._sum.totalPrice || 0,
        });
      }
    } else if (timeframe === "yearly") {
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const existingEntry = timelineArray.find(
        (entry) => entry.label === month
      );
      if (existingEntry) {
        existingEntry.revenue += revenue._sum.totalPrice || 0;
      } else {
        timelineArray.push({
          label: month,
          revenue: revenue._sum.totalPrice || 0,
        });
      }
    }
  }

  const totalRevenue = timelineArray.reduce(
    (sum, entry) => sum + entry.revenue,
    0
  );

  return {
    timeframe,
    totalRevenue,
    timeline: timelineArray,
  };
};

const getTotalRevenueService = async () => {
  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const monthsToInclude = Array.from({ length: currentMonth + 1 }, (_, i) => i);
  const monthlyData: {
    month: string;
    totalRevenue: number;
    totalBooking: number;
  }[] = [];

  const getMonthDates = (month: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  };

  for (const month of monthsToInclude) {
    const { startDate, endDate } = getMonthDates(month);

    const totalRevenue = await prisma.booking.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        bookingStatus: BookingStatus.PAST,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    monthlyData.push({
      month: startDate.toLocaleString("default", { month: "long" }),
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      totalBooking: totalRevenue._count.id,
    });
  }

  const totalBooking = await prisma.booking.count({
    where: { bookingStatus: BookingStatus.PAST },
  });
  const totalPassengerUser = await prisma.user.count({
    where: { role: UserRole.PASSANGER },
  });
  const totalDriver = await prisma.user.count({
    where: { role: UserRole.DRIVER },
  });
  const startMonth = monthlyData.length > 0 ? monthlyData[0].month : null;
  const endMonth =
    monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].month : null;
  return {
    total: { totalBooking, totalDriver, totalPassengerUser },
    startMonth,
    endMonth,
    totalRevenue: monthlyData,
  };
};

const cancelationRate = async () => {
  const year = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const monthsToInclude = Array.from({ length: currentMonth + 1 }, (_, i) => i);
  const monthlyData = [];
  const getMonthDates = (month: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  };

  for (let month of monthsToInclude) {
    const { startDate, endDate } = getMonthDates(month);
    const [totalOrders, totalCompleted, canceledOrders] = await Promise.all([
      prisma.booking.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.booking.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          bookingStatus: BookingStatus.CANCELLED,
        },
      }),
      prisma.booking.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          bookingStatus: BookingStatus.CANCELLED,
        },
      }),
    ]);

    const cancellationRate =
      totalOrders > 0
        ? ((canceledOrders / totalOrders) * 100).toFixed(2)
        : "0.00";

    monthlyData.push({
      month: startDate.toLocaleString("default", { month: "long" }),
      totalCompleted,
      canceledOrders,
      cancellationRate: `${cancellationRate}%`,
    });
  }

  return monthlyData;
};

const topPassenger = async () => {
  const result = await prisma.booking.groupBy({
    by: ["passengerId"],
    _count: { passengerId: true },
    _sum: { totalPrice: true },
    orderBy: { _count: { passengerId: "desc" } },
    take: 10,
  });

  const customerIds = result.map((c) => c.passengerId);
  const customers = await prisma.user.findMany({
    where: { id: { in: customerIds } },
    select: {
      id: true,
      email: true,
      passenger: { select: { fullName: true } },
    },
  });

  const customerMap = new Map(
    customers.map((c) => [c.id, c.passenger?.fullName])
  );

  return result.map((customer) => ({
    fullName: customerMap.get(customer.passengerId) || "Unknown",
    totalBookings: customer._count.passengerId,
    totalPay: customer._sum.totalPrice || 0,
  }));
};

const topDriverList = async () => {
  const topOwners = await prisma.booking.groupBy({
    by: ["driverId"],
    _sum: {
      totalPrice: true,
    },
    _count: {
      id: true,
    },
    where: {
      bookingStatus: BookingStatus.PAST,
    },
    orderBy: {
      _sum: {
        totalPrice: "desc",
      },
    },
    take: 10,
  });

  const ownerDetailsPromises = topOwners.map(async (topOwner) => {
    const owner = await prisma.user.findUnique({
      where: {
        id: topOwner.driverId,
      },
      select: {
        driver: { select: { fullName: true } },
      },
    });

    const totalRatingData = await prisma.driver.findUnique({
      where: { id: topOwner.driverId },
      select: {
        rating: true,
        ratingCount: true,
      },
    });

    const totalBookingCount = await prisma.booking.count({
      where: {
        driverId: topOwner.driverId,
      },
    });

    const totalRatingSum = totalRatingData?.rating || 0;
    const totalRatingCount = totalRatingData?.ratingCount || 0;
    const averageRating =
      totalRatingCount > 0 ? totalRatingSum / totalRatingCount : 0;

    return {
      userId: topOwner.driverId,
      name: owner?.driver?.fullName || "Unknown",
      totalPrice: topOwner._sum.totalPrice || 0,
      totalBookings: totalBookingCount || 0,
      reservationRating: averageRating,
    };
  });

  return await Promise.all(ownerDetailsPromises);
};

const allUsersList = async (
  search: string,
  role: string,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  const result = await prisma.user.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { email: { contains: search } },
                {
                  driver: {
                    fullName: { contains: search, mode: "insensitive" },
                  },
                },
                {
                  passenger: {
                    fullName: { contains: search, mode: "insensitive" },
                  },
                },
              ],
            }
          : {},
        role ? { role: { equals: role as UserRole } } : {},
        {
          role: { not: UserRole.ADMIN },
        },
      ],
    },
    select: {
      email: true,
      role: true,
      status: true,
      passenger: { select: { fullName: true } },
      driver: { select: { fullName: true } },
    },
    skip: skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const count = await prisma.user.count({
    where: {
      AND: [
        search ? { email: { contains: search } } : {},
        role ? { role: { equals: role as UserRole } } : {},
        {
          role: { not: UserRole.ADMIN },
        },
      ],
    },
  });
  const totalPage = Math.ceil(count / limit);
  return {
    meta: { page, limit: limit, count: count, totalPage: totalPage },
    data: result,
  };
};

export const adminAnalysisService = {
  getRevenueForDriverService,
  getTotalRevenueService,
  cancelationRate,
  topPassenger,
  topDriverList,
  allUsersList,
};
