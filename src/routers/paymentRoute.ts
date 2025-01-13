import express, { Request, Response } from "express";
import { createPayment,verifyPayment } from "src/controllers/payment";

const router = express.Router();

// Create Payment Route
router.post("/create-payment", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    const paymentOrder = await createPayment(orderId);

    res.status(200).json({
      success: true,
      orderId: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
    });
  } catch (error) {
    console.error("Error Creating Payment:", error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Verify Payment Route
router.post("/verify-payment", async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const result = await verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error Verifying Payment:", error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
