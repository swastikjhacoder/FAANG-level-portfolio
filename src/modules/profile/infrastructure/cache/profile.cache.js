import redis from "@/shared/lib/redis";

const TTL = 600;

export class ProfileCache {
  getKey(profileId) {
    return `profile:${profileId}`;
  }

  async get(profileId) {
    const data = await redis.get(this.getKey(profileId));

    try {
      return data ? JSON.parse(data) : null;
    } catch {
      await this.invalidate(profileId);
      return null;
    }
  }

  async set(profileId, value) {
    await redis.set(this.getKey(profileId), JSON.stringify(value), "EX", TTL);
  }

  async invalidate(profileId) {
    await redis.del(this.getKey(profileId));
  }
}
