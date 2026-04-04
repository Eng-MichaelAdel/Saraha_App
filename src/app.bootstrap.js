import express from "express";
import { PORT } from "../config/config.service.js";
import dbConnection from "./db/db.connection.js";
import errorHandler from "./middlewares/global-error-handler.middleware.js";
import { authRouter } from "./modules/Auth/index.js";
import { userRouer } from "./modules/User/index.js";

async function bootstrap() {
  // create app instance from express
  const app = express();

  // Database Connection
  dbConnection();
  
  // parse body to JSON
  app.use(express.json());

  // application routing
  app.use("/auth", authRouter);
  app.use("/profile" , userRouer)

  // Invalid app router handler
  app.use("{/*dummy}", (req, res, next) => {
    return res.status(400).json({ message: "invalid application routing" });
  });

  //   global error handler
  app.use(errorHandler);
  // server config
  const port = PORT;
  app.listen(port, () => {
    console.log(`server is connected successfully 🚀 on port :: ${port}`);
  });
}

export default bootstrap;
