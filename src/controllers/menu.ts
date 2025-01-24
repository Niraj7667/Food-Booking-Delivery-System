import { Request, Response } from 'express';
import prisma from '../../prisma/prismaClient';
import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Menu Item
export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
  const { name, description, price, category, dietType, preparationTime } = req.body;
  const restaurantId = req.restaurant?.id;

  if (!restaurantId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: 'Image is required' });
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
      // Delete local file if menu item already exists
      fs.unlinkSync(req.file.path);
      res.status(409).json({ message: 'Menu item already exists' });
      return;
    }

    // Upload the image to Cloudinary
    const uploadedImage = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'menu_items',
    });

    // Delete local file after Cloudinary upload
    fs.unlinkSync(req.file.path);

    if (!uploadedImage.secure_url) {
      throw new Error('Image upload failed');
    }

    // Create the menu item with the Cloudinary image URL
    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image: uploadedImage.secure_url,
        category,
        dietType,
        preparationTime: preparationTime ? parseInt(preparationTime) : undefined,
        restaurantId,
      },
    });

    res.status(201).json({ message: 'Menu item created successfully', menuItem });
  } catch (error) {
    // Attempt to delete local file if an error occurs
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting local file:', unlinkError);
      }
    }
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update Menu Item
export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, price, category, dietType, preparationTime, isAvailable } = req.body;
  const restaurantId = req.restaurant?.id;

  if (!restaurantId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // Get the existing menu item
    const existingMenuItem = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!existingMenuItem) {
      // Delete local file if menu item not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(404).json({ message: 'Menu item not found' });
      return;
    }

    let imageUrl = existingMenuItem.image;

    if (req.file) {
      // Upload the new image to Cloudinary
      const uploadedImage = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: 'menu_items',
      });

      // Delete local file after Cloudinary upload
      fs.unlinkSync(req.file.path);

      if (uploadedImage.secure_url) {
        imageUrl = uploadedImage.secure_url;
      } else {
        throw new Error('Image upload failed');
      }
    }

    // Update the menu item
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        image: imageUrl,
        category: category || undefined,
        dietType: dietType || undefined,
        preparationTime: preparationTime ? parseInt(preparationTime) : undefined,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
      },
    });

    res.json({ message: 'Menu item updated successfully', updatedMenuItem });
  } catch (error) {
    // Attempt to delete local file if an error occurs
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting local file:', unlinkError);
      }
    }
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete Menu Item (unchanged)
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