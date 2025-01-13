import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/prismaClient';

// Extended Request interface
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
    restaurant?: any;
  }
}

// Middleware for user authentication
export const checkUserMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Unauthorized - No token provided' });
    return;
  }

  // Extract user token
  const token = authHeader.startsWith('usertoken ')
    ? authHeader.split(' ')[1]
    : null;
  console.log('Received user token:', token);

  if (!token) {
    res.status(401).json({ message: 'Unauthorized - No user token provided' });
    return;
  }

  try {
    // Verify the user token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { userId: string };

    if (!decoded.userId) {
      res.status(401).json({ message: 'Unauthorized - Invalid user token' });
      return;
    }

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ message: 'Unauthorized - User not found' });
      return;
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('User token verification error:', error);
    res.status(401).json({ message: 'Unauthorized - User token verification failed' });
    return;
  }
};

// Middleware for restaurant authentication
export const checkRestaurantMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Unauthorized - No token provided' });
    return;
  }

  // Extract restaurant token correctly
  const token = authHeader.startsWith('restauranttoken ')
    ? authHeader.split(' ')[1]
    : null;

  console.log('Received restaurant token:', token);

  if (!token) {
    res.status(401).json({ message: 'Unauthorized - No restaurant token provided' });
    return;
  }

  try {
    // Verify the restaurant token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { restaurantId: string };

    if (!decoded.restaurantId) {
      res.status(401).json({ message: 'Unauthorized - Invalid restaurant token' });
      return;
    }

    // Fetch the restaurant from the database
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: decoded.restaurantId },
    });

    if (!restaurant) {
      res.status(401).json({ message: 'Unauthorized - Restaurant not found' });
      return;
    }

    // Attach restaurant to request object
    req.restaurant = restaurant;
    next();
  } catch (error) {
    console.error('Restaurant token verification error:', error);
    res.status(401).json({ message: 'Unauthorized - Restaurant token verification failed' });
    return;
  }
};

// Combined middleware for both user and restaurant authentication
export const checkBothAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Unauthorized - No tokens provided' });
    return;
  }

  const parts = authHeader.split(',').map(part => part.trim());
  const userToken = parts.find(part => part.includes('usertoken'))?.split('=')[1];
  const restaurantToken = parts.find(part => part.startsWith('restauranttoken '))?.split(' ')[1];

  if (!userToken || !restaurantToken) {
    res.status(401).json({ message: 'Unauthorized - Both tokens are required' });
    return;
  }

  try {
    // Verify user token
    const decodedUser = jwt.verify(userToken, process.env.JWT_SECRET_KEY as string) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decodedUser.userId },
    });

    // Verify restaurant token
    const decodedRestaurant = jwt.verify(restaurantToken, process.env.JWT_SECRET_KEY as string) as { restaurantId: string };
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: decodedRestaurant.restaurantId },
    });

    if (!user || !restaurant) {
      res.status(401).json({ message: 'Unauthorized - Invalid credentials' });
      return;
    }

    // Attach both user and restaurant to request object
    req.user = user;
    req.restaurant = restaurant;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Unauthorized - Authentication failed' });
    return;
  }
};