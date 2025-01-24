import multer, { StorageEngine, FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Define the storage engine
const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  },
});

// File filter implementation
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  console.log('File received:', file.fieldname, file.originalname); // Debugging log
  if (file.fieldname === 'image' && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed in the 'image' field!"));
  }
};

// Export the multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});