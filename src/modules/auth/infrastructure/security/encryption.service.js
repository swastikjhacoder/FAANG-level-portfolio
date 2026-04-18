import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const HASH_ALGO = "sha256";

if (!ENCRYPTION_KEY) {
  throw new Error("❌ ENCRYPTION_KEY is not defined");
}

const key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();

export const hashToken = async (value) => {
  if (!value || typeof value !== "string") {
    throw new Error("Invalid value for hashing");
  }

  return crypto.createHash(HASH_ALGO).update(value).digest("hex");
};

export const compareHash = async (value, hash) => {
  if (!value || !hash) {
    throw new Error("Invalid comparison values");
  }

  const valueHash = await hashToken(value);

  const hashBuffer = Buffer.from(hash, "hex");
  const valueBuffer = Buffer.from(valueHash, "hex");

  if (hashBuffer.length !== valueBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(valueBuffer, hashBuffer);
};

export const encrypt = (plaintext) => {
  if (!plaintext || typeof plaintext !== "string") {
    throw new Error("Invalid plaintext");
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
};

export const decrypt = (encryptedData) => {
  if (!encryptedData || typeof encryptedData !== "string") {
    throw new Error("Invalid encrypted data");
  }

  const buffer = Buffer.from(encryptedData, "base64");

  if (buffer.length < 28) {
    throw new Error("Invalid encrypted payload");
  }

  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const text = buffer.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);

  return decrypted.toString("utf8");
};

export const generateSecureToken = (length = 64) => {
  if (typeof length !== "number" || length <= 0) {
    throw new Error("Invalid token length");
  }

  return crypto.randomBytes(length).toString("hex");
};
