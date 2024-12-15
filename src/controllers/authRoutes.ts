import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from 'prisma/prismaClient';
import { generateSalt, hashPassword } from 'utils/cryptoUtils';

// Sign-up route
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'Already have an account. Please log in.' });
      return;
    }

    // Generate a random salt and hash the password
    const salt = generateSalt();
    const hashedPassword = hashPassword(password, salt);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        salt,
        phone,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET_KEY as string, {
      expiresIn: '30d', // 30 days expiration
    });

    // Set cookie with the token
    res.cookie('usertoken', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days in milliseconds

    res.json({
      message: 'User signed up successfully',
      user: newUser,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Login route
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (!existingUser) {
      res.status(401).json({ message: 'Incorrect username or password' });
      return;
    }

    // Validate password
    const hashedPassword = hashPassword(password, existingUser.salt);
    if (hashedPassword !== existingUser.password) {
      res.status(401).json({ message: 'Incorrect username or password' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: existingUser.id }, process.env.JWT_SECRET_KEY as string, {
      expiresIn: '30d', // 30 days expiration
    });

    res.cookie('usertoken', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days in milliseconds
    res.json({ message: 'Login successful', user: existingUser, token });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Logout route
export const logout = (req: Request, res: Response): void => {
  res.clearCookie('usertoken');
  res.json({ message: 'Logout successful' });
};
