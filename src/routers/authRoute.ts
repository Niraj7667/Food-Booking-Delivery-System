import  express  from "express";

import { login,logout,signup } from "src/controllers/authRoutes";

import { restaurantLogin,restaurantLogout,restaurantSignup } from "src/controllers/restaurantauth";
import { validateInput } from "src/middleware/validate";
import { checkAuth } from "src/controllers/checkAuth";

const router = express.Router();

router.post("/signup" , validateInput,signup);
router.post('/login',validateInput,login);
router.post('/logout',logout);
router.get('/check',checkAuth);

router.post("/restaurant/signup",validateInput,restaurantSignup);
router.post('/restaurant/login',validateInput,restaurantLogin);
router.post('/restaurant/logout',validateInput,restaurantLogout);

export default router;