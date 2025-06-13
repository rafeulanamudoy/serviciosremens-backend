import { Response,Request } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ratingService } from "./rating.service";
import sendResponse from "../../../shared/sendResponse";

const createRating = catchAsync(async (req: Request, res: Response) => {

  const result = await ratingService.createRating(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "rating create successfully.",
    data: result,
  });
});


export const ratingController={
    createRating
}