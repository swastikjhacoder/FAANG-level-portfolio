import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

const TOKEN_PEPPER = process.env.TOKEN_PEPPER;
const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER;

if (!TOKEN_PEPPER || !PASSWORD_PEPPER) {
  throw new Error("❌ Missing security environment variables");
}

export const hashPassword = async (password) => {
  if (!password || typeof password !== "string") {
    throw new Error("Invalid password");
  }

  return bcrypt.hash(password.trim() + PASSWORD_PEPPER, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  if (!password || !hash) return false;

  if (await bcrypt.compare(password.trim() + PASSWORD_PEPPER, hash))
    return true;

  return bcrypt.compare(password.trim(), hash);
};

export const hashToken = (token) => {
  if (!token) throw new Error("Token required");

  return crypto.createHmac("sha256", TOKEN_PEPPER).update(token).digest("hex");
};

export const safeCompare = (a, b) => {
  if (!a || !b) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
};

export const generateSecureToken = (size = 32) => {
  return crypto.randomBytes(size).toString("base64url");
};

export const generateTokenWithMeta = () => {
  const raw = crypto.randomBytes(32).toString("base64url");

  return {
    raw,
    hash: hashToken(raw),
    createdAt: Date.now(),
  };
};