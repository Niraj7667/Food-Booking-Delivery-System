import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/prismaClient';

declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
    restaurant?: any;
  }
}

// Middleware for checking the JWT and authenticating the user or restaurant
export const checkAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Unauthorized - No token provided' });
    return;
  }

  const tokenParts = authHeader.split(' '); // Split by space: ["Bearer", "<token>"]

  if (tokenParts.length !== 2 || (tokenParts[0] !== 'Bearer')) {
    res.status(401).json({ message: 'Unauthorized - Invalid token format' });
    return;
  }

  const tokenType = tokenParts[1].startsWith('usertoken') ? 'usertoken' : 'restauranttoken';
  const token = tokenParts[1].replace(`${tokenType} `, ''); // Extract token from the header

  try {
    let decoded: any;
    let user: any;
    let restaurant: any;

    // Handle usertoken
    if (tokenType === 'usertoken') {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
        if (decoded.userId) {
          user = await prisma.user.findUnique({
            where: { id: decoded.userId },
          });

          if (!user) {
             res.status(401).json({ message: 'Unauthorized - User not found' });
             return;
          }

          req.user = user; // Attach user to request object
          return next();
        }
      } catch (error) {
        console.log('User token verification failed');
      }
    }

    // Handle restauranttoken
    if (tokenType === 'restauranttoken') {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
        if (decoded.restaurantId) {
          restaurant = await prisma.restaurant.findUnique({
            where: { id: decoded.restaurantId },
          });

          if (!restaurant) {
             res.status(401).json({ message: 'Unauthorized - Restaurant not found' });
             return;
          }

          req.restaurant = restaurant; // Attach restaurant to request object
          return next();
        }
      } catch (error) {
        console.log('Restaurant token verification failed');
      }
    }

     res.status(401).json({ message: 'Unauthorized - Invalid token' });
     return;
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};
