// controllers/orderController.ts
import { Request, Response } from 'express'
import { OrderService } from 'services/orderService'
import { notifyUserOrderPlaced,notifyRestaurantOrderArrived } from './notifying'

 

export class OrderControllerwithoutmealTime {
  private orderService: OrderService

  constructor() {
    this.orderService = new OrderService()
  }

  createOrderwithoutMeal = async (req: Request, res: Response) => {
    try {

      console.log('Request Body:', req.body);

      const { 
        restaurantId, 
        menuItems, 
        orderType, 
        deliveryAddress, 
        mealTime ,
        paymentMethod,
      } = req.body;
      
      const userId = req.user.id;
      console.log(userId);
      console.log(restaurantId);
      console.log(menuItems);
      console.log(orderType);
      console.log(deliveryAddress);
      console.log(mealTime);
  
      // Validate input
      if (!userId || !restaurantId || !menuItems || !orderType || !paymentMethod || !mealTime) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
  
      // Create a new order if none exists
      const order = await this.orderService.createOrder({
        userId, 
        restaurantId, 
        menuItems, 
        orderType, 
        deliveryAddress, 
        paymentMethod,
        mealTime: mealTime ? new Date(mealTime) : undefined
      });
  
      res.status(201).json(order);
  
      // Notify user and restaurant
      await notifyUserOrderPlaced(order.id); 
      await notifyRestaurantOrderArrived(order.id); 
  
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }
  
}

export class OrderController {
  private orderService: OrderService

  constructor() {
    this.orderService = new OrderService()
  }
  
  createOrder = async (req: Request, res: Response) => {
    try {
      const { 
        restaurantId, 
        menuItems, 
        orderType, 
        deliveryAddress,
        paymentMethod,
      } = req.body;
      
      const userId = req.user.id;
      console.log(userId);
      console.log(restaurantId);
      console.log(menuItems);
      console.log(orderType);
  
      // Validate input
      if (!userId || !restaurantId || !menuItems || !orderType) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
  
      // Create a new order if none exists
      const order = await this.orderService.createOrder({
        userId, 
        restaurantId, 
        menuItems, 
        orderType,
        deliveryAddress, 
        paymentMethod,
      });
  
      res.status(201).json(order);
  
      // Notify user and restaurant
      await notifyUserOrderPlaced(order.id); 
      await notifyRestaurantOrderArrived(order.id); 
  
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }
  
}