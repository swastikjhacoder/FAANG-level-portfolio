import Redis from "ioredis";
import logger from "@/shared/lib/logger";

let redisClient = global.__redisClient;

if (!redisClient) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    reconnectOnError: () => true,
  });

  redisClient.on("connect", () => {
    logger.info("✅ Redis connected");
  });

  redisClient.on("error", (err) => {
    logger.error("❌ Redis error:", err);
  });

  if (process.env.NODE_ENV !== "production") {
    global.__redisClient = redisClient;
  }
}

export class RedisService {
  constructor() {
    this.client = redisClient;
  }

  async connect() {
    if (this.client.status !== "ready") {
      await this.client.connect();
    }
  }

  async disconnect() {
    await this.client.quit();
  }

  async get(key) {
    await this.connect();
    return this.client.get(key);
  }

  async set(key, value, ttl = null) {
    await this.connect();

    if (ttl) {
      return this.client.set(key, value, "EX", ttl);
    }

    return this.client.set(key, value);
  }

  async del(key) {
    await this.connect();
    return this.client.del(key);
  }

  async exists(key) {
    await this.connect();
    return this.client.exists(key);
  }

  async expire(key, ttl) {
    await this.connect();
    return this.client.expire(key, ttl);
  }

  async setJSON(key, value, ttl = null) {
    return this.set(key, JSON.stringify(value), ttl);
  }

  async getJSON(key) {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async increment(key, ttl = 60) {
    await this.connect();

    const count = await this.client.incr(key);

    if (count === 1) {
      await this.client.expire(key, ttl);
    }

    return count;
  }

  async blacklistToken(tokenId, ttl) {
    await this.set(`blacklist:${tokenId}`, "1", ttl);
  }

  async isBlacklisted(tokenId) {
    const exists = await this.exists(`blacklist:${tokenId}`);
    return exists === 1;
  }

  async cacheSession(sessionId, data, ttl = 300) {
    await this.setJSON(`session:${sessionId}`, data, ttl);
  }

  async getSession(sessionId) {
    return this.getJSON(`session:${sessionId}`);
  }

  async deleteSession(sessionId) {
    return this.del(`session:${sessionId}`);
  }

  async flush() {
    await this.connect();
    return this.client.flushdb();
  }

  async healthCheck() {
    try {
      await this.connect();
      const res = await this.client.ping();
      return res === "PONG";
    } catch {
      return false;
    }
  }
}
