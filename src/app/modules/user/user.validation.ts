import { z } from "zod";

const fileSchema = z.object({
  originalname: z.string(),
  mimetype: z.string(),
  path: z.string(),
  filename: z.string(),
});

const userRegisterValidationSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z.string({ required_error: "phone number is required" }),
  fcmToken: z.string({ required_error: "fcm token needed" }),
  password: z.string({ required_error: "password is required" }),
  fullName: z.string({ required_error: "full name is required" }),
  country: z.string({ required_error: "country is required" }),
  city: z.string({ required_error: "city is required" }),
  postalCode: z.string({ required_error: "postal code is required" }),
  expertise: z.array(z.enum(["KITCHEN", "WATCHINE_MATCHINE", "ELECTRICAL"])).min(1, "At least one expertise is required"),

 
 doc: fileSchema.refine(
    (val) => {
      const allowedMimetypes = ["image/jpeg", "image/png", "application/pdf"];
      return allowedMimetypes.includes(val.mimetype);
    },
    {
      message: "Invalid or unsupported file format",
    }
  ),
});

export const userValidation={
  userRegisterValidationSchema
}

//import { z } from "zod";

// const fileSchema = z.object({
//   originalname: z.string(),
//   mimetype: z.string(),
//   path: z.string(),
//   filename: z.string(),
// });

// // Your allowed mimetypes
// const allowedMimetypes = ["image/jpeg", "image/png", "application/pdf"];

// const userRegisterValidationSchema = z.object({
//   // other fields ...

//   // doc is optional but if provided must pass the refinement check
//   doc: z
//     .union([fileSchema, z.undefined()])
//     .refine((val) => {
//       // if no file, no problem (optional)
//       if (val === undefined) return true;

//       // file provided → check mimetype
//       return allowedMimetypes.includes(val.mimetype);
//     }, {
//       message: "Invalid or unsupported file format",
//     }),
// });

// export const userValidation = {
//   userRegisterValidationSchema,
// };
