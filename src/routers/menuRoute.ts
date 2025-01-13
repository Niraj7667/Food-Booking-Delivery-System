import  express  from "express";
import { createMenuItem } from "src/controllers/menu";
import { updateMenuItem } from "src/controllers/menu";
import { deleteMenuItem } from "src/controllers/menu";
import authenticateToken from "src/middleware/authenticate";
import { getRestaurantMenuItems } from "src/controllers/menuItems";
import { checkUserAuth } from "src/controllers/checkAuth";
import { checkRestaurantMiddleware, } from "src/middleware/authMiddleware";

const router = express.Router();

router.post("/additems",checkRestaurantMiddleware, createMenuItem);
router.put("/updateitems/:id",checkRestaurantMiddleware, updateMenuItem);
router.delete("/deleteitems/:id",checkRestaurantMiddleware, deleteMenuItem);
router.get("/items/:restaurantId",getRestaurantMenuItems);

export default router;