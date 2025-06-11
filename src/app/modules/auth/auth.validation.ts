import { z } from "zod";

const authLoginSchema = z.object({
  email: z.string(),
  fcmToken: z.string({ required_error: "fcm token is needed" }),
  password: z.string({ required_error: "password is required" }),
});
const authSocialSchema = z.object({
  email: z.string(),
  fcmToken: z.string({ required_error: "fcm token is needed" }),
  socialLoginType: z.string({ required_error: "social login type  is needed" }),
  fullName:z.string({required_error:"full name is requered"})
});

export const authValidation = {
  authLoginSchema,
  authSocialSchema,
};
