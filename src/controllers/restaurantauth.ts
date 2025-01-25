import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/prismaClient';
import { generateSalt, hashPassword } from '../../utils/cryptoUtils';
import { sendOtpEmail  } from 'utils/emailUtils';
import { generateOtp } from 'utils/otpUtils';


// Send OTP for Restaurant Signup
export const restaurantOtpSignup = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    // Check if the restaurant already exists
    const existingRestaurant = await prisma.restaurant.findUnique({ where: { email } });
    if (existingRestaurant) {
      res.status(409).json({ message: "Restaurant already registered. Please log in." });
      return;
    }

    // Generate OTP and expiration time
    const otp = generateOtp(); // Custom function to generate OTP
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    // Check if OTP already exists for the email
    const existingOtp = await prisma.otp.findUnique({
      where: { email_type: { email, type: 'restaurant' } },
    });

    if (existingOtp) {
      // Send an email indicating OTP already sent
      await sendOtpEmail(email, existingOtp.otp);
      console.log('OTP already sent to the email.');
      res.json({ message: "OTP already sent to the email." });
      return;
    }

    console.log(otp);
    console.log(expiresAt);

    // Save OTP to the database (create if not exists)
    await prisma.otp.create({
      data: { email, otp, expiresAt, type: 'restaurant' },
    });

    // Send OTP to the restaurant's email
    await sendOtpEmail(email, otp); // Custom function to send an email with OTP

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Verify OTP and Complete Restaurant Signup
export const restaurantSignup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone, location, maxTables, openingHours, otp } = req.body;

  try {
    // Check if the restaurant already exists
    const existingRestaurant = await prisma.restaurant.findUnique({ where: { email } });
    if (existingRestaurant) {
      res.status(409).json({ message: "Restaurant already registered. Please log in." });
      return;
    }

    // Verify OTP
    const otpRecord = await prisma.otp.findUnique({ where: { email } });

    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < new Date()) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    // Hash password
    const salt = generateSalt(); // Custom function to generate a salt
    const hashedPassword = hashPassword(password, salt); // Custom function to hash the password
    const qrcode = ""; // Placeholder for QR code logic (if needed)

    // Create a new restaurant
    const newRestaurant = await prisma.restaurant.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        salt,
        location,
        maxTables: parseInt(maxTables),
        openingHours,
      },
    });

    // Delete OTP record after successful verification
    await prisma.otp.delete({ where: { email } });

    // Generate JWT token
    const token = jwt.sign(
      { restaurantId: newRestaurant.id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "30d" }
    );

    // Set cookie with the token
    res.cookie("restauranttoken", token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

    res.json({
      message: "Restaurant registered successfully",
      restaurant: newRestaurant,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
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


// Function to get all restaurants
export const getAllRestaurants = async ( req: Request,res: Response): Promise<void> => {
  try {
    // Fetch all restaurants from the database
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        rating: true,
        createdAt: true,
      },
    });

    // If restaurants exist, send them as response
    if (restaurants.length > 0) {
      res.json(restaurants);
      return;
    } else {
      res.status(404).json({ message: 'No restaurants found' });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};