import Razorpay from "razorpay";
import prisma from "prisma/prismaClient";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Create UPI Payment
export const createPayment = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const options = {
    amount: order.totalAmount * 100, // Amount in paisa (INR)
    currency: "INR",
    receipt: `receipt_${orderId}`,
    payment_capture: 1, // Auto capture
  };

  return await razorpay.orders.create(options);
};

// Verify Payment
export const verifyPayment = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  orderId: string
) => {
  const crypto = require("crypto");
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new Error("Payment verification failed");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { isPaid: true },
  });

  return { success: true, message: "Payment verified and updated" };
};
