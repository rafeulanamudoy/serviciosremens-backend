import Stripe from "stripe";
import config from "../../../config";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { PaymentType, TransactionType } from "@prisma/client";
import axios from "axios";
import { k } from "../../../shared/kkapi";
import httpStatus from "http-status";
const stripe = new Stripe(config.stripe.secretKey as string);

const processRefund = async (paymentIntent: string) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntent,
    });
    return refund.status === "succeeded";
  } catch (error) {
    console.error("Refund failed:", error);
    return false;
  }
};

const passengerPaymentHistoryIntoDB = async (passengerId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      passengerId: passengerId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      totalPrice: true,
      passenger: {
        select: {
          id: true,
          fullName: true,
          avater: true,
        },
      },
    },
  });
  if (!payments || payments.length === 0) {
    throw new ApiError(404, "No payment history found for this passenger");
  }
  const totalEarnings = payments.reduce(
    (sum, payment) => sum + payment.totalPrice,
    0
  );
  return { totalEarnings, payments };
};

const driverPaymentHistoryIntoDB = async (driverId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      driverId: driverId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      totalPrice: true,
      driver: {
        select: {
          id: true,
          fullName: true,
          avater: true,
        },
      },
    },
  });
  if (!payments || payments.length === 0) {
    throw new ApiError(404, "No payment history found for this driver");
  }
  const totalEarnings = payments.reduce(
    (sum, payment) => sum + payment.totalPrice,
    0
  );
  return { totalEarnings, payments };
};

const withdrawMoney = async (amount: number, destinationPhone: string) => {
  const response = await axios.post(
    "https://api.kkiaPay.me/v1/transfer",
    {
      amount,
      destination: destinationPhone,
      destination_type: "CARD",
    },
    {
      headers: {
        Authorization: `Bearer ${config.kkiapay.kkiapay_secret}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

const kkiapayInitiatePaymentIntoDB = async (
  transactionId: string,
  userId: string,
  bookingId: string
) => {
  const verifyPayment = await k.verify(transactionId);
  console.log(verifyPayment);
  if (verifyPayment.status === "SUCCESS") {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        driverId: true,
      },
    });

     
 

    const payment = await prisma.payment.create({
      data: {
        transactionId,
        bookingId,
        driverId: booking?.driverId ?? "",
        fees: verifyPayment.fees ?? 0,
        totalPrice: verifyPayment.amount ?? 0,
        passengerId: userId,
        transactionType: verifyPayment.type as TransactionType,
        paymentType: verifyPayment.source === "CARD" ? "CARD" : "MOBILE_MONEY",
        paymentStatus: true,
      },
    });



    return payment;
  }
  throw new ApiError(
    httpStatus.PARTIAL_CONTENT,
    `Payment verification failed with status: ${verifyPayment.status}`
  );
};

const kkiapayTransactionStatus = async (transactionId: string) => {
  const response = await axios.get(
    `https://api.kkiapay.me/api/v1/transaction/${transactionId}`,
    {
      headers: {
        Authorization: `Bearer ${config.kkiapay.kkiapay_secret}`,
      },
    }
  );
  return response.data;
};

export const paymentsService = {
  processRefund,
  passengerPaymentHistoryIntoDB,
  driverPaymentHistoryIntoDB,
  withdrawMoney,
  kkiapayInitiatePaymentIntoDB,
  kkiapayTransactionStatus,
};
