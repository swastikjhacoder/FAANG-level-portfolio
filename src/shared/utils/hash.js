import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

const TOKEN_PEPPER = process.env.TOKEN_PEPPER || "dev-token-pepper";
const PASSWORD_PEPPER = process.env.PASSWORD_PEPPER || "dev-password-pepper";

const normalize = (value) => {
  return value.trim().normalize("NFKC");
};

export const hashPassword = async (password) => {
  if (!password || typeof password !== "string") {
    throw new Error("Invalid password");
  }

  const normalized = normalize(password);

  return bcrypt.hash(normalized + PASSWORD_PEPPER, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  if (!password || !hash) {
    return { valid: false, needsUpgrade: false };
  }

  const normalized = password.trim().normalize("NFKC");

  const pepperedMatch = await bcrypt.compare(
    normalized + PASSWORD_PEPPER,
    hash,
  );

  if (pepperedMatch) {
    return { valid: true, needsUpgrade: false };
  }

  const legacyMatch = await bcrypt.compare(normalized, hash);

  if (legacyMatch) {
    return { valid: true, needsUpgrade: true };
  }

  return { valid: false, needsUpgrade: false };
};

export const hashToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Token required");
  }

  return crypto.createHmac("sha256", TOKEN_PEPPER).update(token).digest("hex");
};

export const safeCompare = (a, b) => {
  if (!a || !b) return false;

  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) return false;

  try {
    return crypto.timingSafeEqual(bufferA, bufferB);
  } catch {
    return false;
  }
};

export const generateSecureToken = (size = 32) => {
  if (size < 32) {
    throw new Error("Token size too small (min 32 bytes)");
  }

  return crypto.randomBytes(size).toString("base64url");
};

export const generateTokenWithMeta = () => {
  const raw = generateSecureToken(32);

  return {
    raw,
    hash: hashToken(raw),
    createdAt: Date.now(),
  };
};