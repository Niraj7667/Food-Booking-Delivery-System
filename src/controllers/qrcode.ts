// Generate QR Code for Menu
import { Request, Response } from 'express';
import prisma from '../../prisma/prismaClient';
import QRCode from 'qrcode';
import qrcodeReader from 'qrcode-reader';
import * as Jimp from 'jimp';

// Generate QR Code for Menu
export const generateQRCode = async (req: Request, res: Response): Promise<void> => {
    const restaurantId = req.restaurant?.id;
  
    if (!restaurantId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
  
    try {
      const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
      if (!restaurant) {
        res.status(404).json({ message: 'Restaurant not found' });
        return;
      }
  
      // Ensure the full URL with http:// or https://
      const menuURL = new URL(`/restaurants/${restaurantId}/menu`, process.env.FRONTEND_URL).href;
      const qrCode = await QRCode.toDataURL(menuURL);
  
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: { qrCode },
      });
  
      res.json({ message: 'QR Code generated successfully', qrCode });
    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  


  // Read QR Code and Redirect
export const readQRCodeAndRedirect = async (req: Request, res: Response): Promise<void> => {
    const { image } = req.body;
  
    if (!image) {
      res.status(400).json({ message: 'Image is required' });
      return;
    }
  
    try {
      const imageBuffer = Buffer.from(image, 'base64');
      const jimpImage = await (Jimp as any).read(imageBuffer);
      const qr = new qrcodeReader();
  
      qr.callback = (err, value) => {
        if (err || !value) {
          res.status(400).json({ message: 'Invalid QR code' });
          return;
        }
  
        // Ensure it is a valid URL
        const url = value.result.startsWith('http://') || value.result.startsWith('https://')
          ? value.result
          : `${process.env.FRONTEND_URL}${value.result}`;
  
        res.redirect(url);
      };
  
      qr.decode(jimpImage.bitmap);
    } catch (error) {
      console.error('Error reading QR code:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  