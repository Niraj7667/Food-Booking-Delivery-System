import nodemailer from "nodemailer";
import prisma from "prisma/prismaClient"; // Ensure you have prisma client instance configured


// Email setup with Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Use environment variables for security
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Accept self-signed certificates
  }
});

// Function to send email notifications
const sendEmail = async (email, subject, message) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Sender address
      to: email, // Receiver's email address
      subject, // Subject line
      text: message, // Plain text message body
      html: `<p>${message}</p>`, // HTML email body
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}: ${error.message}`);
  }
};

// Notify the restaurant about a new order
export const notifyRestaurantOrderArrived = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      restaurant: true,
      menuItems: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  if (!order) {
    console.error("Order not found");
    return;
  }

  const restaurantEmail = order.restaurant.email;
  const orderedItems = order.menuItems
    .map(
      (item) => `${item.menuItem.name} (Quantity: ${item.quantity})`
    )
    .join("\n");

  const message = `
    New Order Received!
    Order ID: ${order.id}
    Ordered Items:
    ${orderedItems}
    Delivery Address: ${order.deliveryAddress}
    Order Type: ${order.orderType}
    Payment Method: ${order.paymentMethod}
    Total Amount: $${order.totalAmount.toFixed(2)}

    Customer Details:
    Name: ${order.user.name}
    Phone: ${order.user.phone || "not Provided"}
  `;

  await sendEmail(restaurantEmail, "New Order Arrived!", message);
};

// Notify the user when their order is placed
export const notifyUserOrderPlaced = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      restaurant: true,
      menuItems: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  if (!order) {
    console.error("Order not found");
    return;
  }

  const userEmail = order.user.email;
  const orderedItems = order.menuItems
    .map(
      (item) => `${item.menuItem.name} (Quantity: ${item.quantity})`
    )
    .join("\n");

  const message = `
    Your Order has been Placed!
    
    Order Details:
    Order ID: ${order.id}
    Items Ordered:
    ${orderedItems}

    Restaurant Details:
    Name: ${order.restaurant.name}
    Email: ${order.restaurant.email}
    Phone: ${order.restaurant.phone || "Not provided"}

    We are preparing your meal and will notify you when it's ready!
  `;

  await sendEmail(userEmail, "Your Order has been Placed!", message);
};


// Notify the user when their order is completed
export const notifyUserOrderCompleted = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      menuItems: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  if (!order) {
    console.error("Order not found");
    return;
  }

  const userEmail = order.user.email;
  const orderedItems = order.menuItems
    .map(
      (item) => `${item.menuItem.name} (Quantity: ${item.quantity})`
    )
    .join("\n");

  const message = `
    Your Order is Ready for Pickup or Delivery!
    
    Order Details:
    Order ID: ${order.id}
    Items Ordered:
    ${orderedItems}

    Thank you for choosing us!
  `;

  await sendEmail(userEmail, "Your Order is Ready!", message);
};

// Notify the user when their order is cancelled
export const notifyUserOrderCancelled = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      menuItems: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  if (!order) {
    console.error("Order not found");
    return;
  }

  const userEmail = order.user.email;
  const orderedItems = order.menuItems
    .map(
      (item) => `${item.menuItem.name} (Quantity: ${item.quantity})`
    )
    .join("\n");

  const message = `
    We regret to inform you that your order has been cancelled.
    
    Order Details:
    Order ID: ${order.id}
    Items Ordered:
    ${orderedItems}

    We apologize for any inconvenience caused.
  `;

  await sendEmail(userEmail, "Your Order has been Cancelled", message);
};

