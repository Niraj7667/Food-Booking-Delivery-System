import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/prismaClient';
import { generateSalt, hashPassword } from '../../utils/cryptoUtils';
import QRCode from 'qrcode';

// Generate a unique URL
const generateUniqueUrl = (restaurantId: string): string => {
  return `${process.env.BASE_URL}/menu/${restaurantId}`;
};

// Restaurant Signup
export const restaurantSignup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, location, maxTables, paymentMethods, openingHours } = req.body;

  try {
    // Check if the restaurant already exists
    const existingRestaurant = await prisma.restaurant.findUnique({ where: { email } });
    if (existingRestaurant) {
       res.status(409).json({ message: "Restaurant already registered. Please log in." });
       return;
    }

    // Hash password
    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);
    const qrcode = "";
    // Create a new restaurant
    const newRestaurant = await prisma.restaurant.create({
      data: {
        name,
        email,
        password: hashedPassword,
        salt,
        location,
        qrCode : qrcode, 
        maxTables,
        paymentMethods,
        openingHours,
      },
    });

    // Generate QR code from URL
    const uniqueUrl = generateUniqueUrl(newRestaurant.id);
    const qrCodeDataUrl = await QRCode.toDataURL(uniqueUrl);

    // Update restaurant with QR code
    await prisma.restaurant.update({
      where: { id: newRestaurant.id },
      data: { qrCode: qrCodeDataUrl },
    });

    // Generate JWT token
    const token = jwt.sign(
      { restaurantId: newRestaurant.id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "30d" },
    );

    res.cookie("restauranttoken", token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
     res.json({
      message: "Restaurant registered successfully",
      restaurant: newRestaurant,
      token,
    });
    return;
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

// Restaurant Login
export const restaurantLogin = async (req: Request, res: Response) : Promise<void> => {
  const { email, password } = req.body;

  try {
    const existingRestaurant = await prisma.restaurant.findUnique({ where: { email } });

    if (!existingRestaurant) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const hashedPassword = hashPassword(password, existingRestaurant.salt);

    if (hashedPassword !== existingRestaurant.password) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { restaurantId: existingRestaurant.id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "30d" },
    );

    res.cookie("restauranttoken", token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
     res.json({
      message: "Login successful",
      restaurant: existingRestaurant,
      token,
    });
    return;
  } catch (error) {
     res.status(500).json({ error: "Internal Server Error" });
     return;
  }
};

// Restaurant Logout
export const restaurantLogout = (req: Request, res: Response): void=> {
  res.clearCookie("restauranttoken");
  res.json({ message: "Logout successful" });
  return;
};
