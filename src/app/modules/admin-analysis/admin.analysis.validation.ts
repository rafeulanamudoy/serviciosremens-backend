import { z } from "zod";
import { expertiseEnum } from "../../../enum/expertiseEnum"; // assuming it's z.enum([...])

const jobCreateSchema = z.object({
  customerName: z.string({ required_error: "Customer name is required" }),

  serviceName: expertiseEnum.refine(
    (val) => expertiseEnum.options.includes(val),
    {
      message: "Invalid service type. Must be one of: " + expertiseEnum.options.join(", "),
    }
  ),

  location: z.string({ required_error: "Location is required" }),

  scheduleTime: z
    .string({ required_error: "Schedule time is required" })
    .refine((value) => !isNaN(Date.parse(value)), {
      message: "Invalid ISO date format",
    }),
});
const assignJob = z.object({
  jobId: z.string({ required_error: "jobId is required" }),


  technicionId: z.string({ required_error: "technicionId  is required" })

 
});
export const adminValidation = {
  jobCreateSchema,
  assignJob,
};
