import express from "express";
import { generateQRCode,readQRCodeAndRedirect } from "src/controllers/qrcode";
import authenticateToken from "src/middleware/authenticate";

const router = express.Router();

router.post("/generateqrcode",authenticateToken,generateQRCode);
router.post("/readqrcode",readQRCodeAndRedirect);

export default router;