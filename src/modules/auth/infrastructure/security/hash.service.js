import bcrypt from "bcryptjs";

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

/**
 * @param {string} password
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
  if (!password || typeof password !== "string") {
    throw new Error("Invalid password");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hash) => {
  if (!password || typeof password !== "string") {
    throw new Error("Invalid password");
  }

  if (!hash || typeof hash !== "string") {
    throw new Error("Invalid hash");
  }

  return bcrypt.compare(password, hash);
};

export const DUMMY_PASSWORD_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEeO9r9GqQ8K/ux6j7a8qG9Q5e5e5e5e5eO";

export const safeCompare = async (password, userHash) => {
  const hashToCompare = userHash || DUMMY_PASSWORD_HASH;
  return comparePassword(password, hashToCompare);
};
