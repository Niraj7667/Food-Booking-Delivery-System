import { Request, Response } from 'express';
import prisma from 'prisma/prismaClient'; // Adjusted import path




// Get all menu items for a specific restaurant
export const getRestaurantMenuItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const { restaurantId } = req.params;

        // Validate restaurant ID (ensure it's a valid string/number)
        if (!restaurantId) {
            res.status(400).json({ error: 'Restaurant ID is required' });
            return;
        }

        // Validate restaurant existence
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { id: true, name: true ,location: true,openingHours : true} // Only select necessary fields
        });

        if (!restaurant) {
            res.status(404).json({ error: 'Restaurant not found' });
            return;
        }

        // Retrieve menu items
        const menuItems = await prisma.menuItem.findMany({
            where: { 
                restaurantId: restaurantId 
            },
            select: {
                id: true,
                name: true,
                price: true,
                description: true,
                image: true,
                category: true,
                dietType: true,
                preparationTime: true,
                isAvailable: true
            },
            orderBy: {
                name: 'asc' // Optional: order menu items alphabetically
            }
        });

        // Return restaurant name and menu items
        res.status(200).json({ 
            restaurantName: restaurant.name, 
            menuItems: menuItems,
            restaurantLocation: restaurant.location,
            restaurantOpeningHours: restaurant.openingHours,
        });

    } catch (error) {
        console.error('Error retrieving menu items:', error);
        
        // More informative error handling
        if (error instanceof Error) {
            res.status(500).json({ 
                error: 'Internal server error', 
                message: error.message 
            });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
};

// Optional: Create a separate error handler middleware for more robust error handling
export const handleMenuItemErrors = (err: Error, req: Request, res: Response, next: Function) => {
    console.error('Unhandled menu item error:', err);
    res.status(500).json({ 
        error: 'Unexpected error in menu item operations',
        message: err.message 
    });
};

