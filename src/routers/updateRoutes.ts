import  express  from "express";
import { updateRestaurantProfile } from "src/updates/restaurantprofile";
import { updateUserProfile } from "src/updates/userProfile";
import authenticateToken from "src/middleware/authenticate";
const router = express.Router();

router.post('/user',authenticateToken, updateUserProfile);
router.post('/restaurant',authenticateToken,updateRestaurantProfile);

export  default router;