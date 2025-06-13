import { z } from "zod";

const createRatingSchema = z.object({
  name: z.string({ required_error: "customer name is required" }),
  address: z.string({ required_error: "address is required" }),
  rating: z.number({ required_error: "rating is required" }),
  technicionId: z.string({ required_error: "technicionId is required" }),
  comment: z.string({ required_error: "comment is required" }),
});

export const ratingValidation = {
  createRatingSchema,
};
