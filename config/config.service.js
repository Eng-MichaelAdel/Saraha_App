import { config } from "dotenv";
import { resolve } from "node:path";

export const NODE_ENV = process.env.NODE_ENV;

config({ path: resolve(`./config/.env.${NODE_ENV}`) });

// server
export const PORT = process.env.PORT ?? "3000";

// Database
export const DB_URI = process.env.DB_URI ?? "mongodb+srv://Maico89:si7o123456789@cluster0.hosd7nf.mongodb.net/Saraha_App";
