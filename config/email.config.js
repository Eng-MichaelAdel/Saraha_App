import { EMAIL_PASS, EMAIL_SERVICE, EMAIL_USER } from "./env.config.js";
import { NODE_ENV } from "./env.config.js";

export const emailConfig = {
  service: EMAIL_SERVICE, 
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: NODE_ENV === "development" ? false : true,
  },
};
