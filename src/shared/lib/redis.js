import { createClient } from "redis";
import { env } from "@/shared/config/env";
import logger from "./logger";

const globalCache = global.__redis || {
  client: null,
  isConnecting: false,
};

if (!global.__redis) {
  global.__redis = globalCache;
}

export const connectRedis = async () => {
  if (globalCache.client) {
    return globalCache.client;
  }

  if (globalCache.isConnecting) {
    while (globalCache.isConnecting) {
      await new Promise((res) => setTimeout(res, 50));
    }
    return globalCache.client;
  }

  globalCache.isConnecting = true;

  try {
    const client = createClient({
      url: env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error("REDIS_RECONNECT_FAILED");
            return new Error("Redis reconnect failed");
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    client.on("connect", () => {
      logger.info("REDIS_CONNECTING");
    });

    client.on("ready", () => {
      logger.info("REDIS_READY");
    });

    client.on("error", (err) => {
      logger.error("REDIS_ERROR", { error: err.message });
    });

    client.on("end", () => {
      logger.warn("REDIS_CONNECTION_CLOSED");
    });

    await client.connect();

    globalCache.client = client;
    return client;
  } catch (err) {
    logger.error("REDIS_INIT_FAILED", { error: err.message });
    throw err;
  } finally {
    globalCache.isConnecting = false;
  }
};

export const getRedis = async () => {
  if (!globalCache.client) {
    return await connectRedis();
  }
  return globalCache.client;
};

const safeExec = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    logger.error("REDIS_COMMAND_ERROR", { error: err.message });
    return null;
  }
};

export const redisSet = async (key, value, ttlSeconds = null) => {
  const client = await getRedis();

  const payload = typeof value === "string" ? value : JSON.stringify(value);

  return safeExec(async () => {
    if (ttlSeconds) {
      return await client.set(key, payload, { EX: ttlSeconds });
    }
    return await client.set(key, payload);
  });
};

export const redisGet = async (key) => {
  const client = await getRedis();

  const result = await safeExec(() => client.get(key));

  if (!result) return null;

  try {
    return JSON.parse(result);
  } catch {
    return result;
  }
};

export const redisDel = async (key) => {
  const client = await getRedis();
  return safeExec(() => client.del(key));
};

export const redisExists = async (key) => {
  const client = await getRedis();
  return safeExec(() => client.exists(key));
};

export const redisExpire = async (key, ttlSeconds) => {
  const client = await getRedis();
  return safeExec(() => client.expire(key, ttlSeconds));
};

export const redisIncr = async (key) => {
  const client = await getRedis();
  return safeExec(() => client.incr(key));
};

export const redisDeletePattern = async (pattern) => {
  const client = await getRedis();

  const keys = await safeExec(() => client.keys(pattern));

  if (!keys || keys.length === 0) return 0;

  return safeExec(() => client.del(keys));
};

export const disconnectRedis = async () => {
  if (!globalCache.client) return;

  try {
    await globalCache.client.quit();
    globalCache.client = null;
    logger.info("REDIS_DISCONNECTED");
  } catch (err) {
    logger.error("REDIS_DISCONNECT_ERROR", {
      error: err.message,
    });
  }
};
