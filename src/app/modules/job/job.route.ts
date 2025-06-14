import express from "express";

import validateRequest from "../../middlewares/validateRequest";
import { jobController } from "./job.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get(
  "/get-technicion-job",
auth(),
  jobController.getTechnicionJob
);
export const jobRoute = router;
