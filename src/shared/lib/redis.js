import Redis from "ioredis";
import { env } from "@/shared/config/env";
import logger from "./logger";

const globalCache = global.__redis || {
  client: null,
};

if (!global.__redis) {
  global.__redis = globalCache;
}

export const getRedis = () => {
  if (globalCache.client) return globalCache.client;

  try {
    const client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });

    client.on("connect", () => logger.info("REDIS_CONNECTING"));
    client.on("ready", () => logger.info("REDIS_READY"));
    client.on("error", (err) =>
      logger.error("REDIS_ERROR", { error: err.message }),
    );

    globalCache.client = client;
    return client;
  } catch (err) {
    logger.error("REDIS_INIT_FAILED", { error: err.message });
    return null;
  }
};

export const redisIncr = async (key) => {
  const client = getRedis();
  if (!client) return null;
  return client.incr(key);
};

export const redisExpire = async (key, ttl) => {
  const client = getRedis();
  if (!client) return null;
  return client.expire(key, ttl);
};
