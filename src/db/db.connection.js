import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";
import { messageModel, userModel } from "./models/index.js";

const dbConnection = async () => {
  try {
    const result = await mongoose.connect(DB_URI);
    await userModel.syncIndexes();
    await messageModel.syncIndexes();
    console.log("Database is connected ❤️");
  } catch (error) {
    console.log("Unable to connect to the database 😢", error);
  }
};

export default dbConnection;
