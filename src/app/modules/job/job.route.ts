import express from "express";

import validateRequest from "../../middlewares/validateRequest";
import { jobController } from "./job.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/get-technicion-incoming-job", auth(), jobController.getTechnicionIncomingJob);
router.patch("/update-job-status", auth(), jobController.updateAssignJobStatus);
export const jobRoute = router;
