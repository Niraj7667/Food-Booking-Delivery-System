import { Request, Response, NextFunction } from 'express';
import { CreateOrderRequestDTO,OrderType } from 'types/order';

export function validateOrderRequest(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const { 
    restaurantId, 
    menuItems, 
    orderType,
    deliveryAddress,
    mealTime
  } = req.body as CreateOrderRequestDTO;

  // // Check required fields
  // if (!userId) {
  //   res.status(400).json({ error: 'User ID is required' });
  //   return;
  // }

  if (!restaurantId) {
     res.status(400).json({ error: 'Restaurant ID is required' });
     return;
  }

  if (!menuItems || menuItems.length === 0) {
     res.status(400).json({ error: 'At least one menu item is required' });
     return;
  }

  // Validate menu items
  const invalidItems = menuItems.filter(
    item => !item.menuItemId || item.quantity <= 0
  );
  if (invalidItems.length > 0) {
     res.status(400).json({ 
      error: 'Invalid menu items. Each item must have a valid ID and quantity > 0' 
    });
    return;
  }

  // Order type specific validations
  switch (orderType) {
    case OrderType.HOME_DELIVERY:
      if (!deliveryAddress) {
         res.status(400).json({ 
          error: 'Delivery address is required for home delivery' 
        });
        return;
      }
      break;
    
    case OrderType.DINE_IN_ADVANCE:
      if (!mealTime) {
         res.status(400).json({ 
          error: 'Meal time is required for dine-in advance orders' 
        });
        return;
      }
      break;
    
    default:
     res.status(400).json({ error: 'Invalid order type' });
     return;
  }

  next();
}