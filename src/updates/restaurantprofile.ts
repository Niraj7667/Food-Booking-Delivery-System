import { Request, Response } from 'express';
import prisma from '../../prisma/prismaClient';

// Restaurant Profile Update
export const updateRestaurantProfile = async (req: Request, res: Response): Promise<void> => {
  const { name, location,email, paymentMethods, maxTables, openingHours } = req.body;
  const restaurantId = req.restaurant?.id; // Assuming restaurant is authenticated and restaurant data is available in req.restaurant

  if (!restaurantId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // Update restaurant details
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        name: name || undefined,
        location: location || undefined,
        paymentMethods: paymentMethods || undefined,
        email: email || undefined,
        maxTables: maxTables || undefined,
        openingHours: openingHours || undefined,
      },
    });

    res.json({
      message: 'Restaurant profile updated successfully',
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error('Error updating restaurant profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
