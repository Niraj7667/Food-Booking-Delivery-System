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
export const checkUserAuth = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
     res.status(401).json({ message: 'Unauthorized - No token provided' });
     return;
  }

  // Extract user token
  const token = authHeader.split(' ').find((part) => part.includes('usertoken'))?.split('=')[1];
  console.log('Received user token:', token);

  if (!token) {
     res.status(401).json({ message: 'Unauthorized - No user token provided' });
     return
  }

  try {
    // Verify the user token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { userId: string };

    if (!decoded.userId) {
      res.status(401).json({ message: 'Unauthorized - Invalid user token' });
      return
    }

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
       res.status(401).json({ message: 'Unauthorized - User not found' });
       return
    }

    // Return success response
    res.status(200).json({ message: 'Authenticated as user', user });
    return
  } catch (error) {
    console.error('User token verification error:', error);
     res.status(401).json({ message: 'Unauthorized - User token verification failed' });
     return
  }
};

// Middleware for restaurant authentication
export const checkRestaurantAuth = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
     res.status(401).json({ message: 'Unauthorized - No token provided' });
     return
  }

  // Extract restaurant token correctly
  const token = authHeader.startsWith('restauranttoken ')
    ? authHeader.split(' ')[1]
    : null;

  console.log('Received restaurant token:', token);

  if (!token) {
     res.status(401).json({ message: 'Unauthorized - No restaurant token provided' });
     return
  }

  try {
    // Verify the restaurant token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { restaurantId: string };

    if (!decoded.restaurantId) {
       res.status(401).json({ message: 'Unauthorized - Invalid restaurant token' });
       return
    }

    // Fetch the restaurant from the database
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: decoded.restaurantId },
    });

    if (!restaurant) {
     res.status(401).json({ message: 'Unauthorized - Restaurant not found' });
     return
    }

    // Return success response
     res.status(200).json({ message: 'Authenticated as restaurant', restaurantId: restaurant.id });
     return 
  } catch (error) {
    console.error('Restaurant token verification error:', error);
     res.status(401).json({ message: 'Unauthorized - Restaurant token verification failed' });
     return
  }
};
