import ApiError from "../errors/ApiErrors";
import prisma from "../shared/prisma";
import generateOTP from "./generateOtp";
import { sendMessage } from "./sendaMessage";

const sendOtpToUserNumber = async (phoneNumber: string) => {
  const user = await prisma.user.findUnique({ where: { phoneNumber } });
  if (!user) {
    throw new ApiError(
      404,
      "The phone number is not registered. Please sign up first."
    );
  }

  // Generate a 4-digit OTP
  const otpCode = generateOTP();
  const OTP_EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutes
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_TIME);
  
  await prisma.otp.upsert({
    where: { phoneNumber },
    update: { otpCode, expiresAt },
    create: { phoneNumber, otpCode, expiresAt },
  });

  return otpCode;
};

export default sendOtpToUserNumber;
