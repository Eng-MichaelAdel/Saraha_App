import {  ForbiddenException } from "../src/common/index.js";
import { CORS_WHITELIST_ORIGIN } from "./env.config.js";

const whiteListOrigin = CORS_WHITELIST_ORIGIN;

export const corsOptions = {
  origin: (origin, callback) => {
    if (whiteListOrigin.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new ForbiddenException("CORS policy: Origin not allowed"));
    }
  },
};
