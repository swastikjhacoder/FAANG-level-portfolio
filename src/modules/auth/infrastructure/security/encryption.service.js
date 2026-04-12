import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const HASH_ALGO = "sha256";

if (!ENCRYPTION_KEY) {
  throw new Error("❌ ENCRYPTION_KEY is not defined");
}

const key = crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();

/**
 * @param {string} value
 * @returns {string} hex hash
 */
export const hashToken = async (value) => {
  if (!value || typeof value !== "string") {
    throw new Error("Invalid value for hashing");
  }

  return crypto.createHash(HASH_ALGO).update(value).digest("hex");
};

export const compareHash = async (value, hash) => {
  const valueHash = await hashToken(value);

  return crypto.timingSafeEqual(
    Buffer.from(valueHash, "hex"),
    Buffer.from(hash, "hex"),
  );
};

/**
 * @param {string} plaintext
 * @returns {string}
 */
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

/**
 * @param {string} encryptedData
 * @returns {string}
 */
export const decrypt = (encryptedData) => {
  if (!encryptedData || typeof encryptedData !== "string") {
    throw new Error("Invalid encrypted data");
  }

  const buffer = Buffer.from(encryptedData, "base64");

  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const text = buffer.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);

  return decrypted.toString("utf8");
};

export const generateSecureToken = (length = 64) => {
  return crypto.randomBytes(length).toString("hex");
};
