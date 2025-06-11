//

import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { userService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import Api from "twilio/lib/rest/Api";
import config from "../../../config";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const fileUrl = `${config.backend_base_url}/uploads/${req?.file!.filename}`;
  req.body.doc = fileUrl;
  const result = await userService.createUser(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User Create Successfully",
    data: result,
  });
});

export const userController = {
  createUser,
};
