import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
  if (!password || typeof password !== "string") {
    throw new Error("Invalid password");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  if (!password || !hash) return false;

  return bcrypt.compare(password, hash);
};

export const hashSHA256 = (value) => {
  if (!value) throw new Error("Value required for hashing");

  return crypto.createHash("sha256").update(value).digest("hex");
};

export const hashHMAC = (value, secret) => {
  if (!value || !secret) {
    throw new Error("Value and secret required");
  }

  return crypto.createHmac("sha256", secret).update(value).digest("hex");
};

export const hashToken = (token) => {
  if (!token) throw new Error("Token required");

  return hashSHA256(token);
};

export const safeCompare = (a, b) => {
  if (!a || !b) return false;

  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) return false;

  return crypto.timingSafeEqual(bufferA, bufferB);
};

export const generateSecureToken = (size = 32) => {
  return crypto.randomBytes(size).toString("hex");
};
