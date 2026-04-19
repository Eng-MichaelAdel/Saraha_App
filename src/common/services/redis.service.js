import { redisClient } from "../Clients/index.js";

export const set = async ({ key, value, options } = {}) => {
  try {
    return  redisClient.set(key, value, options);
  } catch (error) {
    console.log("fail in Redis SET Opreration", error);
  }
};

export const update = async ({ key, value, options } = {}) => {
  try {
    if (!(await redisClient.get(key))) {
      return 0;
    }
    return  redisClient.set(key, value, options);
  } catch (error) {
    console.log("fail in Redis update Opreration", error);
  }
};

export const get = async (key) => {
  try {
    return  redisClient.get(key);
  } catch (error) {
    console.log("fail in Redis GET Opreration", error);
  }
};

export const mget = async (keys = []) => {
  try {
    if (!keys.length) {
      return 0;
    }
    return  redisClient.mGet(keys);
  } catch (error) {
    console.log("fail in Redis MGET Opreration", error);
  }
};

export const ttl = async (key) => {
  try {
    return  redisClient.ttl(key);
  } catch (error) {
    console.log("fail in Redis TTL Opreration", error);
  }
};

export const exists = async (key) => {
  try {
    return  redisClient.exists(key);
  } catch (error) {
    console.log("fail in Redis EXISTS Opreration", error);
  }
};

export const expire = async ({ key, ttl }) => {
  try {
    return  redisClient.expire(key, ttl);
  } catch (error) {
    console.log("fail in Redis EXPIRE Opreration", error);
  }
};

export const keys = async (prefix="") => {
  try {
    return  redisClient.keys(`${prefix}*`);
  } catch (error) {
    console.log("fail in Redis KEYS Opreration", error);
  }
};

export const del = async (keys) => {
  try {
    if (Array.isArray(keys)) {
      if (!keys.length) return 0;
    }

    return  redisClient.del(keys);
  } catch (error) {
    console.log("fail in Redis DEL Opreration", error);
  }
};

export const persist = async (key) => {
  try {
    return  redisClient.persist(key);
  } catch (error) {
    console.log("fail in Redis PERSIST Opreration", error);
  }
};

export const incr = async (key) => {
  try {
    return  redisClient.incr(key);
  } catch (error) {
    console.log("fail in Redis INCR Opreration", error);
  }
};
