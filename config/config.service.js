import { config } from "dotenv";
import { resolve } from "node:path";

export const NODE_ENV = process.env.NODE_ENV;

config({ path: resolve(`./config/.env.${NODE_ENV}`) });

// server
export const PORT = process.env.PORT ?? "3000";

// Database
export const DB_URI = process.env.DB_URI ?? "mongodb+srv://Maico89:si7o123456789@cluster0.hosd7nf.mongodb.net/Saraha_App";

//  Encryption and Decryption
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
export const IV_LENGTH = parseInt(process.env.IV_LENGTH) ?? 16;

// Hash
export const SALT_ROUND = parseInt(process.env.SALT_ROUND) ?? 12;

// jwt secrets
export const JWT_SECRETS = {
  user: {
    accessSignature: process.env.USER_JWT_ACCESS_SECRET,
    accessExp: process.env.USER_JWT_ACCESS_EXP,
    refreshSignature: process.env.USER_JWT_REFRESH_SECRET,
    refreshExp: process.env.USER_JWT_REFRESH_EXP,
  },
  admin: {
    accessSignature: process.env.ADMIN_JWT_ACCESS_SECRET,
    accessExp: process.env.ADMIN_JWT_ACCESS_EXP,
    refreshSignature: process.env.ADMIN_JWT_REFRESH_SECRET,
    refreshExp: process.env.ADMIN_JWT_REFRESH_EXP,
  },
};

// cors
export const CORS_WHITELIST_ORIGIN = process.env.CORS_WHITELIST_ORIGIN.split(",");

// GCP
export const gcp = {
  WEB_CLIENT_ID: process.env.GCP_CLIENT_ID,
};
