import { createClient } from "redis";
import { REDIS_URL } from "../../../config/config.service.js";

export const redisClient = createClient({ url: REDIS_URL });

export const RedisConnection = async () => {
  try {
    await redisClient.connect();
    console.log("Redis Database is connected 💕");
  } catch (error) {
    console.log("Unable to connect to the redis database ❌", error);
  }
};
