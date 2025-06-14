import { z } from "zod";
import { expertiseEnum } from "../../../enum/expertiseEnum"; // assuming it's z.enum([...])
const locationSchema = z.object({
  lat: z
    .number({ required_error: "Latitude is required" })
    .min(-90, "Latitude must be >= -90")
    .max(90, "Latitude must be <= 90"),
  lng: z
    .number({ required_error: "Longitude is required" })
    .min(-180, "Longitude must be >= -180")
    .max(180, "Longitude must be <= 180"),
  address: z
    .string({ required_error: "Address is required" })
    .min(1, "Address cannot be empty"),
});
const jobCreateSchema = z.object({
  customerName: z.string({ required_error: "Customer name is required" }),
  description: z.string({ required_error: "description is required" }),

  serviceName: expertiseEnum.refine(
    (val) => expertiseEnum.options.includes(val),
    {
      message:
        "Invalid service type. Must be one of: " +
        expertiseEnum.options.join(", "),
    }
  ),

  location: locationSchema,

  scheduleTime: z
    .string({ required_error: "Schedule time is required" })
    .refine((value) => !isNaN(Date.parse(value)), {
      message: "Invalid ISO date format",
    }),
});
const assignJob = z.object({
  jobId: z.string({ required_error: "jobId is required" }),

  technicionId: z.string({ required_error: "technicionId  is required" }),
});
export const adminValidation = {
  jobCreateSchema,
  assignJob,
};
