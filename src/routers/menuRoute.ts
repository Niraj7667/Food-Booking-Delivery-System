import  express  from "express";
import { createMenuItem } from "src/controllers/menu";
import { updateMenuItem } from "src/controllers/menu";
import { deleteMenuItem } from "src/controllers/menu";
import authenticateToken from "src/middleware/authenticate";

const router = express.Router();

router.post("/additems",authenticateToken, createMenuItem);
router.put("/updateitems/:id",authenticateToken, updateMenuItem);
router.delete("/deleteitems/:id",authenticateToken, deleteMenuItem);

export default router;