import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import prisma from "prisma/prismaClient";

import authRoute from "./src/routers/authRoute";



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


  app.get("/", (req: Request, res: Response) => {
    res.send("Hello, TypeScript!");
  });




app.listen(PORT, () => {
  console.log(`Service active on PORT ${PORT}`);
});



