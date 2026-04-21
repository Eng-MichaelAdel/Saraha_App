import { createClient } from "redis";
import { redisConfig } from "./../../../config/redis.config.js";

export const redisClient = createClient(redisConfig());

export const RedisConnection = async () => {
  try {
    await redisClient.connect();
    console.log("Redis Database is connected 💕");
  } catch (error) {
    console.log("Unable to connect to the redis database ❌", error);
  }
};
