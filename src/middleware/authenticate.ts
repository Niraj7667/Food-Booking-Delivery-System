import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from 'prisma/prismaClient';

const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userToken = req.cookies.usertoken;
  const restaurantToken = req.cookies.restauranttoken;

  // Check if neither token is provided
  if (!userToken && !restaurantToken) {
    res.status(403).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    let decoded: any;
    let user: any;
    let restaurant: any;

    // If userToken is provided, authenticate the user
    if (userToken) {
      decoded = jwt.verify(userToken, process.env.JWT_SECRET_KEY as string);
      if (!decoded.userId) {
         res.status(403).json({ message: 'Invalid token. Missing userId in token' });
         return;
      }

      // Fetch the user from the database
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
         res.status(403).json({ message: 'Invalid token. User not found' });
         return;
      }

      req.user = user; // Attach the user to the request object

    }

    // If restaurantToken is provided, authenticate the restaurant
     if (restaurantToken) {
      decoded = jwt.verify(restaurantToken, process.env.JWT_SECRET_KEY as string);
      if (!decoded.restaurantId) {
         res.status(403).json({ message: 'Invalid token. Missing restaurantId in token' });
         return;
      }

      // Fetch the restaurant from the database
      restaurant = await prisma.restaurant.findUnique({
        where: { id: decoded.restaurantId },
      });

      if (!restaurant) {
         res.status(403).json({ message: 'Invalid token. Restaurant not found' });
         return;
      }

      req.restaurant = restaurant; // Attach the restaurant to the request object
    }

    // Proceed to the next middleware if either user or restaurant is authenticated
    next();

  } catch (error) {
    console.error("Error in token authentication middleware:", error);
     res.status(403).json({ message: 'Invalid token' });
     return;
  }
};

export default authenticateToken;
