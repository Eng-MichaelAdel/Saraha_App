import { errorResponse } from "../src/common/utils/index.js";
import { CORS_WHITELIST_ORIGIN } from "./config.service.js";

const whiteListOrigin = CORS_WHITELIST_ORIGIN;

export const corsOptions = {
  origin: (origin, callback) => {
    if (whiteListOrigin.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(errorResponse({ message: "not allowed by CORS" }));
    }
  },
};
