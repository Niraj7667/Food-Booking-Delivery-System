import { Request, Response } from 'express';
import prisma from '../../prisma/prismaClient';
import { hashPassword, generateSalt } from '../../utils/cryptoUtils'; // Assuming hashPassword and generateSalt utilities

// User Profile Update
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, address } = req.body;
  const userId = req.user?.id; // Assuming user is authenticated and user data is available in req.user

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // Prepare update data
    const updateData: any = {};

    // Update name and email if provided
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Handle password update (only if provided)
    if (password) {
      const salt = generateSalt(); // Generate new salt
      const hashedPassword = hashPassword(password, salt); // Hash the password with the new salt
      updateData.password = hashedPassword;
      updateData.salt = salt; // Save the new salt
    }

    // Handle address update (if provided, ensure it's an array of strings)
    if (address) {
      // Ensure address is an array of strings, even if it's a single string provided
      updateData.address = { set: Array.isArray(address) ? address : [address] }; // Update multiple addresses
    }

    // Update user details
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
