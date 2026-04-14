import { getRedis } from "@/shared/lib/redis";

const TTL = 600;

export class ProfileCache {
  getKey(profileId) {
    return `profile:${profileId}`;
  }

  async get(profileId) {
    const redis = await getRedis();

    const data = await redis.get(this.getKey(profileId));
    return data ? JSON.parse(data) : null;
  }

  async set(profileId, value) {
    const redis = await getRedis();

    await redis.set(this.getKey(profileId), JSON.stringify(value), "EX", TTL);
  }

  async invalidate(profileId) {
    const redis = await getRedis();

    await redis.del(this.getKey(profileId));
  }
}
