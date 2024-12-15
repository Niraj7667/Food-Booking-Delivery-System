// src/types/custom.d.ts or any other appropriate location
import { User } from '@prisma/client';  // Adjust this import based on your Prisma User model
import { Restaurant } from '@prisma/client';  // Adjust this import based on your Prisma Restaurant model

declare global {
  namespace Express {
    interface Request {
      user?: User;  // Add user property to the request
      restaurant?: Restaurant;  // Add restaurant property to the request
    }
  }
}
