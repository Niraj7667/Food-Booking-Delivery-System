import express from "express";
import {
  notifyRestaurantOrderArrived,
  notifyUserOrderCancelled,
  notifyUserOrderCompleted,
  notifyUserOrderPlaced,
} from "../controllers/notifying";


const router = express.Router();

// Route to notify the restaurant when an order arrives
router.post("/notify/restaurant/order-arrived", async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
     res.status(400).json({ error: "Order ID is required" });
     return;
  }

  try {
    await notifyRestaurantOrderArrived(orderId);
     res.status(200).json({ message: "Restaurant notified about the new order" });
     return;
  } catch (error) {
     res.status(500).json({ error: "Error notifying restaurant: " + error.message });
     return;
  }
});

// Route to notify the user when their order is placed
router.post("/notify/user/order-placed", async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
     res.status(400).json({ error: "Order ID is required" });
     return;
  }

  try {
    await notifyUserOrderPlaced(orderId);
     res.status(200).json({ message: "User notified about the order placement" });
     return;
  } catch (error) {
     res.status(500).json({ error: "Error notifying user: " + error.message });
     return
  }
});

// Route to notify the user when their order is completed
router.post("/notify/user/order-completed", async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
     res.status(400).json({ error: "Order ID is required" });
     return;
  }

  try {
    await notifyUserOrderCompleted(orderId);
     res.status(200).json({ message: "User notified about the order completion" });
     return;
  } catch (error) {
     res.status(500).json({ error: "Error notifying user: " + error.message });
     return;
  }
});

// Route to notify the user when their order is cancelled
router.post("/notify/user/order-cancelled", async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
     res.status(400).json({ error: "Order ID is required" });
     return;
  }

  try {
    await notifyUserOrderCancelled(orderId);
     res.status(200).json({ message: "User notified about the order cancellation" });
     return;
  } catch (error) {
     res.status(500).json({ error: "Error notifying user: " + error.message });
     return;
  }
});

export default router;
