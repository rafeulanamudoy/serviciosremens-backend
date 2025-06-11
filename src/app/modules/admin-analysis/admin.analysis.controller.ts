import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { adminAnalysisService } from "./admin.analysis.service";
import sendResponse from "../../../shared/sendResponse";

const getRevenueForDriver = catchAsync(async (req: Request, res: Response) => {
  const { timeframe = "weekly" } = req.query;
  const driverId = req.user.id as string;

  const result = await adminAnalysisService.getRevenueForDriverService(
    driverId as string,
    timeframe as "weekly" | "monthly" | "yearly"
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Revenue data retrieved successfully.",
    data: result,
  });
});

const getTotalRevenue = catchAsync(async (req: Request, res: Response) => {
  const result = await adminAnalysisService.getTotalRevenueService();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Total revenue analysis retrieved successfully.",
    data: result,
  });
});

const getCancellationRate = catchAsync(async (req: Request, res: Response) => {
  const result = await adminAnalysisService.cancelationRate();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Cancellation rate data retrieved successfully.",
    data: result,
  });
});

const getTopPassengers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminAnalysisService.topPassenger();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Top passengers retrieved successfully.",
    data: result,
  });
});

const getTopDrivers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminAnalysisService.topDriverList();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Top drivers retrieved successfully.",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { search = "", role = "", page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  const result = await adminAnalysisService.allUsersList(
    search as string,
    role as string,
    pageNumber,
    limitNumber
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Users retrieved successfully.",
    data: result,
  });
});

export const adminController = {
  getRevenueForDriver,
  getTotalRevenue,
  getCancellationRate,
  getTopPassengers,
  getTopDrivers,
  getAllUsers,
};
