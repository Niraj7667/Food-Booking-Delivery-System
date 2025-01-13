import  express  from "express";

import { login,logout,signup } from "src/controllers/authRoutes";

import { restaurantLogin,restaurantLogout,restaurantSignup } from "src/controllers/restaurantauth";
import { validateInput } from "src/middleware/validate";
import { checkUserAuth , checkRestaurantAuth } from "src/controllers/checkAuth";

const router = express.Router();

router.post("/signup" , validateInput,signup);
router.post('/login',login);
router.post('/logout',logout);
router.get('/check/user',checkUserAuth);
router.get('/check/restaurant',checkRestaurantAuth);

router.post("/restaurant/signup",restaurantSignup);
router.post('/restaurant/login',restaurantLogin);
router.post('/restaurant/logout',validateInput,restaurantLogout);

export default router;