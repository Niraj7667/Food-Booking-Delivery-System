// Import necessary modules
import { Request, Response } from 'express';
import prisma from '../../prisma/prismaClient';


// Create Menu Item
export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
  const { name, description, price, image, category, dietType, preparationTime } = req.body;
  const restaurantId = req.restaurant?.id;

  if (!restaurantId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // Check if the menu item already exists
    const existingMenuItem = await prisma.menuItem.findFirst({
      where: {
        name,
        restaurantId,
      },
    });

    if (existingMenuItem) {
      res.status(409).json({ message: 'Menu item already exists' });
      return;
    }

    // Create the menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        category,
        dietType,
        preparationTime: preparationTime ? parseInt(preparationTime) : undefined,
        restaurantId,
      },
    });

    res.status(201).json({ message: 'Menu item created successfully', menuItem });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Update Menu Item
export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, price, image, category, dietType, preparationTime, isAvailable } = req.body;
  const restaurantId = req.restaurant?.id;

  if (!restaurantId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        image: image || undefined,
        category: category || undefined,
        dietType: dietType || undefined,
        preparationTime: preparationTime ? parseInt(preparationTime) : undefined,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
      },
    });

    res.json({ message: 'Menu item updated successfully', updatedMenuItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete Menu Item
export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const restaurantId = req.restaurant?.id;

  if (!restaurantId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    await prisma.menuItem.delete({ where: { id } });
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

