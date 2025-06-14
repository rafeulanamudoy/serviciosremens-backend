import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import prisma from "../../../shared/prisma";
import { adminAnalysisService } from "./admin.analysis.service";
const adminLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await adminAnalysisService.adminLogin(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User successfully logged in",
    data: result,
  });
});
const createJob = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await adminAnalysisService.createJob(data);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "job create successfully",
    data: result,
  });
});
const asssignJob=catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await adminAnalysisService.assignJob(data);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "job assign  successfully",
    data: result,
  });
});
const getAllTecnicion=catchAsync(async (req: Request, res: Response) => {

  const result = await adminAnalysisService.getAllTecnicion();
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "get all technicion  successfully",
    data: result,
  });
});
const updateTechnicionStatus=catchAsync(async (req: Request, res: Response) => {
   const {userId,status}=req.body
 
  const result = await adminAnalysisService.updateTechnicionStatus(userId,status);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "user status updated successfully",
    data: result,
  });
});
const getFeedBack=catchAsync(async (req: Request, res: Response) => {
  
  let { page = 1, limit = 10, status } = req.query;
  page = Number(page);
  limit = Number(limit);
  const result = await adminAnalysisService.getFeedBack(page,limit);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "user feed back get successfully",
    data: result,
  });
});

const getAllJobs=catchAsync(async (req: Request, res: Response) => {
  
  let { page = 1, limit = 10, status } = req.query;
  page = Number(page);
  limit = Number(limit);

  console.log(page,limit)
  const result = await adminAnalysisService.getAllJobs(page,limit);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "all job get successfully",
    data: result,
  });
});
export const adminAnalysisController = {
  createJob,
  adminLogin,
  asssignJob,
  getAllTecnicion,
  updateTechnicionStatus,
  getFeedBack,
  getAllJobs
};
