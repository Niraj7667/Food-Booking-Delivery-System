import express, {  Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoute from "./src/routers/authRoute";
import updateroute from "./src/routers/updateRoutes"
import menuRoute from "./src/routers/menuRoute";
import qrcodeRoute from "./src/routers/qrcodeRoute"



const app = express();
const PORT = process.env.PORT || 3000;

app
  .use(cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true, // Enable cookies
  }))
  .use(helmet())
  .use(morgan("dev"))
  .use(express.json())
  .use(cookieParser());


app.use('/auth',authRoute)
app.use('/update',updateroute);
app.use('/menu',menuRoute);
app.use('/qrcode',qrcodeRoute);


  app.get("/", ( res: Response) => {
    res.send("Hello, TypeScript!");
  });




app.listen(PORT, () => {
  console.log(`Service active on PORT ${PORT}`);
});



