const read = (key) => {
  const value = process.env[key];
  if (typeof value === "string") return value.trim();
  return value;
};

const required = (key) => {
  const value = read(key);

  if (!value) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }

  return value;
};

const optional = (key, defaultValue = undefined) => {
  const value = read(key);

  if (value === undefined || value === "") {
    return defaultValue;
  }

  return value;
};

const toNumber = (value, key) => {
  if (value === undefined || value === null || value === "") {
    throw new Error(`❌ Missing number for env ${key}`);
  }

  const num = Number(value);

  if (!Number.isFinite(num)) {
    throw new Error(`❌ Invalid number for env ${key}`);
  }

  return num;
};

const toBoolean = (value, key) => {
  if (typeof value !== "string") {
    throw new Error(`❌ Invalid boolean for env ${key}`);
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;

  throw new Error(`❌ Invalid boolean for env ${key}`);
};

const toEnum = (value, allowed, key) => {
  if (!value) {
    throw new Error(`❌ Missing value for env ${key}`);
  }

  if (!allowed.includes(value)) {
    throw new Error(
      `❌ Invalid value for ${key}. Allowed: ${allowed.join(", ")}`,
    );
  }

  return value;
};

const normalizeUrl = (url) => {
  if (!url) return url;
  return url.replace(/\/+$/, "");
};

const parseList = (value) => {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

export const env = Object.freeze({
  NODE_ENV: toEnum(
    optional("NODE_ENV", "development"),
    ["development", "production", "test"],
    "NODE_ENV",
  ),

  APP_URL: normalizeUrl(optional("APP_URL", "http://localhost:3000")),

  API_BASE_URL: normalizeUrl(required("API_BASE_URL")),

  MONGODB_URL: required("MONGODB_URL"),

  REDIS_URL: optional("REDIS_URL"),

  ACCESS_TOKEN_SECRET: required("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: required("REFRESH_TOKEN_SECRET"),

  ACCESS_TOKEN_EXPIRY: optional("ACCESS_TOKEN_EXPIRY", "15m"),
  REFRESH_TOKEN_EXPIRY: optional("REFRESH_TOKEN_EXPIRY", "7d"),

  BCRYPT_SALT_ROUNDS: toNumber(
    optional("BCRYPT_SALT_ROUNDS", "12"),
    "BCRYPT_SALT_ROUNDS",
  ),

  ENCRYPTION_KEY: required("ENCRYPTION_KEY"),
  COOKIE_SECRET: required("COOKIE_SECRET"),

  TOKEN_PEPPER: required("TOKEN_PEPPER"),
  PASSWORD_PEPPER: required("PASSWORD_PEPPER"),

  COOKIE_SECURE: toBoolean(optional("COOKIE_SECURE", "false"), "COOKIE_SECURE"),

  RATE_LIMIT_MAX: toNumber(optional("RATE_LIMIT_MAX", "100"), "RATE_LIMIT_MAX"),

  RATE_LIMIT_WINDOW_MS: toNumber(
    optional("RATE_LIMIT_WINDOW_MS", "900000"),
    "RATE_LIMIT_WINDOW_MS",
  ),

  CORS_ORIGINS: parseList(optional("CORS_ORIGIN", "http://localhost:3000")),

  LOG_LEVEL: optional("LOG_LEVEL", "info"),

  ENABLE_GRAPHQL_INTROSPECTION: toBoolean(
    optional("ENABLE_GRAPHQL_INTROSPECTION", "false"),
    "ENABLE_GRAPHQL_INTROSPECTION",
  ),

  SMTP_HOST: required("SMTP_HOST"),
  SMTP_PORT: toNumber(required("SMTP_PORT"), "SMTP_PORT"),
  SMTP_USER: required("SMTP_USER"),
  SMTP_PASS: required("SMTP_PASS"),
  SMTP_FROM: required("SMTP_FROM"),

  CLOUDINARY_CLOUD_NAME: required("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: required("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: required("CLOUDINARY_API_SECRET"),

  VERCEL_URL: optional("VERCEL_URL"),
});
