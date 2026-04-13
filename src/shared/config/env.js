const required = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }

  return value;
};

const optional = (key, defaultValue = undefined) => {
  const value = process.env[key];

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

  if (["true", "1"].includes(normalized)) return true;
  if (["false", "0"].includes(normalized)) return false;

  throw new Error(`❌ Invalid boolean for env ${key}`);
};

const toEnum = (value, allowed, key) => {
  if (!allowed.includes(value)) {
    throw new Error(
      `❌ Invalid value for ${key}. Allowed: ${allowed.join(", ")}`,
    );
  }
  return value;
};

const normalizeUrl = (url) => url.replace(/\/+$/, "");

const parseList = (value) => {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

export const env = {
  NODE_ENV: toEnum(
    optional("NODE_ENV", "development"),
    ["development", "production", "test"],
    "NODE_ENV",
  ),

  APP_URL: normalizeUrl(optional("APP_URL", "http://localhost:3000")),

  MONGODB_URL: required("MONGODB_URL"),

  REDIS_URL: optional("REDIS_URL"),

  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),

  JWT_ACCESS_EXPIRES_IN: optional("JWT_ACCESS_EXPIRES_IN", "15m"),
  JWT_REFRESH_EXPIRES_IN: optional("JWT_REFRESH_EXPIRES_IN", "7d"),

  BCRYPT_SALT_ROUNDS: toNumber(
    optional("BCRYPT_SALT_ROUNDS", "12"),
    "BCRYPT_SALT_ROUNDS",
  ),

  COOKIE_SECURE: toBoolean(optional("COOKIE_SECURE", "false"), "COOKIE_SECURE"),

  RATE_LIMIT_MAX: toNumber(optional("RATE_LIMIT_MAX", "100"), "RATE_LIMIT_MAX"),

  RATE_LIMIT_WINDOW_MS: toNumber(
    optional("RATE_LIMIT_WINDOW_MS", "900000"),
    "RATE_LIMIT_WINDOW_MS",
  ),

  CORS_ORIGINS: parseList(optional("CORS_ORIGINS", "http://localhost:3000")),

  LOG_LEVEL: optional("LOG_LEVEL", "info"),

  ENABLE_GRAPHQL_INTROSPECTION: toBoolean(
    optional("ENABLE_GRAPHQL_INTROSPECTION", "false"),
    "ENABLE_GRAPHQL_INTROSPECTION",
  ),
};
