import express from "express";
import { ratingController } from "./rating.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ratingValidation } from "./rating.validation";

const router = express.Router();

router.post(
  "/create",
  validateRequest(ratingValidation.createRatingSchema),
  ratingController.createRating
);
export const ratingRoute = router;
