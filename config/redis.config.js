import { REDIS_URL } from "./env.config.js";

export const redisConfig = () => {
  return { url: REDIS_URL };
};
