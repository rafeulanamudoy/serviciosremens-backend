import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { paymentsService } from "./payment.service";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiErrors";

const passengerPaymentHistory = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id as string;
    const result = await paymentsService.passengerPaymentHistoryIntoDB(userId);
    console.log(result);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Passenger payment history retrieved successfully",
      data: result,
    });
  }
);

const driverPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id as string;
  const result = await paymentsService.driverPaymentHistoryIntoDB(userId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Driver payment history retrieved successfully",
    data: result,
  });
});

const withdrawMoney = catchAsync(async (req: Request, res: Response) => {
  const { amount } = req.body;
  const accountId = req.user.stripeCustomerId as string;

  if (!amount || amount <= 0) {
    throw new ApiError(400, "Invalid withdrawal amount");
  }

  const result = await paymentsService.withdrawMoney(amount, accountId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Withdrawal request processed successfully",
    data: result,
  });
});

const kkiapayInitiatePayment = catchAsync(
  async (req: Request, res: Response) => {
    const { transactionId, bookingId } = req.body;
    const { id: userId } = req.user;
    const result = await paymentsService.kkiapayInitiatePaymentIntoDB(
      transactionId,
      userId,
      bookingId
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Kkiapay payment initiated successfully",
      data: result,
    });
  }
);

export const paymentController = {
  passengerPaymentHistory,
  driverPaymentHistory,
  withdrawMoney,
  kkiapayInitiatePayment,
};
