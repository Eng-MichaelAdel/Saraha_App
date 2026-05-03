import { ipKeyGenerator } from "express-rate-limit";
import { getCounryCode, TooManyRequestsException } from "../src/common/index.js";

export const limiterOptions = {
  windowMs: 15 * 60 * 1000,
  limit: async (req) => {
    const ip = req.headers["x-forword-for"];
    const counntryCode = await getCounryCode(ip);
    switch (counntryCode) {
      case "EG":
        return 6;
        break;
      default:
        return 3;
        break;
    }
  },
  handler: (req, res, next) => {
    throw new TooManyRequestsException("you reached the limit of requests ,please try again later");
  },
  legacyHeaders: false,
  skipFailedRequests: true,
  requestPropertyName: "rate_limiter_data",
  keyGenerator: (req, res) => {
    const ip = ipKeyGenerator(req.headers["x-forword-for"]);
    return `${ip}_${req.path}`;
  },
};
