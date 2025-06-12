import express from "express";

import { userController } from "./user.controller";
import { userValidation } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";
import { localFileUploader } from "../../../helpers/localFileUploader";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { injectFileIntoBody } from "../../middlewares/injectFile";

const router = express.Router();

router.post(
  "/create",
   localFileUploader.doc,
   injectFileIntoBody("doc"),
 
 
  parseBodyData,

  validateRequest(userValidation.userRegisterValidationSchema),
  userController.createUser
);
export const userRoute = router;
