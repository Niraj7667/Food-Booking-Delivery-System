// controllers/orderController.ts
import { Request, Response } from 'express';
import prisma from 'prisma/prismaClient'; // Assuming you have Prisma Client initialized

import {
  notifyUserOrderPlaced,
  notifyUserOrderCompleted,
  notifyUserOrderCancelled,
  notifyRestaurantOrderArrived } from './notifying'; // Assuming you have a separate service for notifications


export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
      const userId = req.user?.id;

      if (!userId) {
          res.status(400).json({ error: 'User ID is required' });
          return;
      }

      const orders = await prisma.order.findMany({
          where: {
              userId,
          },
          include: {
              menuItems: {
                  select: {
                      menuItem: {
                          select: { name: true },
                      },
                      quantity: true,
                  },
              },
              restaurant: {
                  select: {
                      name: true,
                      location: true,
                      email: true,
                  },
              },
          },
          orderBy: { createdAt: 'desc' },
      });

      if (orders.length === 0) {
          res.status(404).json({ message: 'No active orders found for this user' });
          return;
      }

      const formattedOrders = orders.map(order => ({
          id: order.id,
          orderType: order.orderType,
          deliveryAddress: order.deliveryAddress,
          mealTime: order.mealTime,
          status: order.status,
          paymentMethod: order.paymentMethod,
          totalAmount: order.totalAmount,
          items: order.menuItems,
          isActive : order.isActive,
          restaurantName: order.restaurant.name,
          restaurantAddress: order.restaurant.location,
          restaurantEmail: order.restaurant.email,
      }));

      res.status(200).json(formattedOrders);
  } catch (error) {
      console.error('Error retrieving user orders:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

export const getRestaurantOrders = async (req: Request, res: Response): Promise<void> => {
  try {
      const restaurantId = req.restaurant?.id;

      if (!restaurantId) {
          res.status(400).json({ error: 'Restaurant ID is required' });
          return;
      }

      const orders = await prisma.order.findMany({
          where: {
              restaurantId,
              isActive: true,
          },
          include: {
              menuItems: {
                  include: {
                      menuItem: {
                          select: { name: true },
                      },
                  },
              },
              user: {
                  select: {
                      name: true,
                      phone: true,
                  },
              },
          },
          orderBy: { createdAt: 'desc' },
      });

      if (orders.length === 0) {
          res.status(404).json({ message: 'No active orders found for this restaurant' });
          return;
      }

      const filteredOrders = orders.map(order => ({
          orderId: order.id,
          userName: order.user.name,
          phoneNumber: order.user.phone,
          orderType: order.orderType,
          deliveryAddress: order.deliveryAddress,
          paymentMethod: order.paymentMethod,
          orderedItems: order.menuItems.map(item => ({
              name: item.menuItem.name,
              quantity: item.quantity,
          })),
          totalAmount: order.totalAmount,
          status: order.status,
          mealTime: order.mealTime,
      }));

      res.status(200).json(filteredOrders);
  } catch (error) {
      console.error('Error retrieving restaurant orders:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};




export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate order ID and status
    if (!orderId || !status) {
      res.status(400).json({ error: 'Order ID and status are required' });
      return;
    }

    // Validate that the status is one of the accepted values
    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid order status' });
      return;
    }

    // Update the order status and mark as inactive if completed or cancelled
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: status,
        isActive: status !== 'COMPLETED' && status !== 'CANCELLED',
      },
      include: {
        menuItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true, // Include user's email for notifications
          },
        },
        restaurant: {
          select: {
            email: true, // Include restaurant's email for notifications
          },
        },
      },
    });

    // Format the response
    const response = {
      orderId: updatedOrder.id,
      userName: updatedOrder.user.name,
      status: updatedOrder.status,
      isActive: updatedOrder.isActive,
      items: updatedOrder.menuItems.map((item) => ({
        name: item.menuItem.name,
        quantity: item.quantity,
      })),
      totalAmount: updatedOrder.totalAmount,
      paymentMethod: updatedOrder.paymentMethod,
      deliveryAddress: updatedOrder.deliveryAddress,
      mealTime: updatedOrder.mealTime,
      orderType: updatedOrder.orderType,
    };
    
    // Return the updated order data as the response
    res.status(200).json(response); 
    
    // Send notifications based on the new order status
    switch (status) {
      case 'PENDING':
        // Notify user and restaurant when order is placed
        await notifyUserOrderPlaced(updatedOrder.id);
        await notifyRestaurantOrderArrived(updatedOrder.id);
        break;

      case 'PREPARING':
        // Notify user that their order is being prepared
        break;

      

      case 'COMPLETED':
        // Notify user that their order has been completed
        await notifyUserOrderCompleted(updatedOrder.id);
        break;

      case 'CANCELLED':
        // Notify user that their order was cancelled
        await notifyUserOrderCancelled(updatedOrder.id);
        break;

      default:
        console.log('No notifications for this status change');
        break;
    }

    
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};



  
export const getinactiveOrderDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.restaurant?.id;

    if (!restaurantId) {
      res.status(400).json({ error: 'Restaurant ID is required' });
      return;
    }

    const inactiveOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        isActive: false,
      },
      include: {
        menuItems: {
          include: {
            menuItem: {
              select: { name: true },
            },
          },
        },
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filteredOrders = inactiveOrders.map(order => ({
      orderId: order.id,
      userName: order.user.name,
      phoneNumber: order.user.phone,
      orderType: order.orderType,
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      orderedItems: order.menuItems.map(item => ({
        name: item.menuItem.name,
        quantity: item.quantity,
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      mealTime: order.mealTime,
    }));

    res.status(200).json(filteredOrders);
  } catch (error) {
    console.error('Error retrieving inactive orders:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};
