import cors from "cors";
import express from "express";
import { PORT } from "../config/config.service.js";
import dbConnection from "./db/db.connection.js";
import { authRouter } from "./modules/Auth/index.js";
import { userRouer } from "./modules/User/index.js";
import { globalErrorHandler } from "./middlewares/index.js";
import { corsOptions } from "../config/cors.config.js";
import { resolve } from "node:path";
import {  RedisConnection } from "./common/index.js";


async function bootstrap() {
  // create app instance from express
  const app = express();

  // Database Connection
  await dbConnection();

  // Redis dbConnection
  await RedisConnection();

  //  cors
  app.use(cors(corsOptions));

  // apploads middleware
  app.use("/uploads", express.static(resolve("../uploads")));

  // parse body to JSON
  app.use(express.json());

  // application routing
  app.use("/auth", authRouter);
  app.use("/user", userRouer);

  // Invalid app router handler
  app.use("{/*dummy}", (req, res, next) => {
    return res.status(400).json({ message: "invalid application routing" });
  });

  //   global error handler
  app.use(globalErrorHandler);
  // server config
  const port = PORT;
  app.listen(port, () => {
    console.log(`server is connected successfully 🚀 on port :: ${port}`);
  });
}

export default bootstrap;
