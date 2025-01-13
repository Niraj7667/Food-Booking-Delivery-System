import express from 'express'
import { OrderController, OrderControllerwithoutmealTime } from '../controllers/orderController';
import { validateOrderRequest } from 'src/middleware/validateorder'
import { getUserOrders , getRestaurantOrders,updateOrderStatus,getinactiveOrderDetails } from 'src/controllers/ordermanage'
import { getAllRestaurants } from "../controllers/restaurantauth";
import { checkRestaurantMiddleware,checkUserMiddleware } from 'src/middleware/authMiddleware'
const router = express.Router()

const orderControllerWithoutMealTime = new OrderControllerwithoutmealTime();
const orderController = new OrderController();

// Create a new order       
router.post('/create/online', validateOrderRequest, checkUserMiddleware, orderController.createOrder);
router.post('/create/dineinadvance', checkUserMiddleware,validateOrderRequest, orderControllerWithoutMealTime.createOrderwithoutMeal)

router.get("/user",checkUserMiddleware,getUserOrders);
router.get("/restaurant",checkRestaurantMiddleware,getRestaurantOrders);
router.get("/inactive",checkRestaurantMiddleware,getinactiveOrderDetails);
router.put("/updatestatus/:orderId",checkRestaurantMiddleware,updateOrderStatus);
router.get('/restaurants', getAllRestaurants);

export default router;