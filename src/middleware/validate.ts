import { Request, Response, NextFunction } from "express";

// Function to validate email format
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Function to validate phone number format (simple 10 digits format)
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/; // Matches 10 digits only (adjust if necessary for your format)
  return phoneRegex.test(phone);
};

// Middleware for input validation
export const validateInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, password, phone } = req.body;

  // Check if username is invalid (null, undefined, or blank)
  if (!name || typeof name !== "string" || name.trim() === "") {
    res.status(400).json({ message: "Invalid username" });
    return;
  }

  // Check if email is invalid (null, undefined, or not a valid email format)
  if (!email || typeof email !== "string" || !validateEmail(email)) {
    res.status(400).json({ message: "Invalid email" });
    return;
  }

  // Check if password is invalid (null, undefined, or blank)
  if (!password || typeof password !== "string" || password.trim() === "") {
    res.status(400).json({ message: "Invalid password" });
    return;
  }

  // Check if phone is invalid (null, undefined, or not a valid phone number)
  if (!phone || typeof phone !== "string" || !validatePhone(phone)) {
    res.status(400).json({ message: "Invalid phone number" });
    return;
  }

  // If all input is valid, proceed to the next middleware or route handler
  next();
};
