import { RedisService } from "../../infrastructure/cache/redis.service";

const redis = new RedisService();

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 60;
const BLOCK_SECONDS = 60 * 5;

const getBlockDuration = (attempts) => {
  if (attempts < MAX_ATTEMPTS) return 0;

  return BLOCK_SECONDS * Math.pow(2, attempts - MAX_ATTEMPTS);
};

const ipKey = (ip) => `bf:ip:${ip}`;
const emailKey = (email) => `bf:email:${email}`;
const blockKey = (key) => `bf:block:${key}`;

export const checkBruteForce = async ({ ip, email }) => {
  const ipBlocked = await redis.exists(blockKey(ipKey(ip)));
  const emailBlocked = await redis.exists(blockKey(emailKey(email)));

  if (ipBlocked || emailBlocked) {
    throw new Error("Too many attempts. Try again later.");
  }
};

export const registerFailure = async ({ ip, email }) => {
  const ipAttempts = await redis.increment(ipKey(ip), WINDOW_SECONDS);
  const emailAttempts = await redis.increment(emailKey(email), WINDOW_SECONDS);

  const attempts = Math.max(ipAttempts, emailAttempts);

  const blockDuration = getBlockDuration(attempts);

  if (blockDuration > 0) {
    await redis.set(blockKey(ipKey(ip)), "1", blockDuration);
    await redis.set(blockKey(emailKey(email)), "1", blockDuration);
  }

  return {
    attempts,
    blockedFor: blockDuration,
  };
};

export const registerSuccess = async ({ ip, email }) => {
  await redis.del(ipKey(ip));
  await redis.del(emailKey(email));

  await redis.del(blockKey(ipKey(ip)));
  await redis.del(blockKey(emailKey(email)));
};
