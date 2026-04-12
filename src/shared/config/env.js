const required = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }

  return value;
};

const optional = (key, defaultValue = undefined) => {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
};

const toNumber = (value, key) => {
  const num = Number(value);

  if (isNaN(num)) {
    throw new Error(`❌ Invalid number for env ${key}`);
  }

  return num;
};

const toBoolean = (value) => {
  return value === "true";
};

export const env = {
  NODE_ENV: optional("NODE_ENV", "development"),

  APP_URL: optional("APP_URL", "http://localhost:3000"),

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

  COOKIE_SECURE: toBoolean(optional("COOKIE_SECURE", "false")),

  RATE_LIMIT_MAX: toNumber(optional("RATE_LIMIT_MAX", "100"), "RATE_LIMIT_MAX"),

  RATE_LIMIT_WINDOW_MS: toNumber(
    optional("RATE_LIMIT_WINDOW_MS", "900000"), // 15 min
    "RATE_LIMIT_WINDOW_MS",
  ),

  CORS_ORIGINS: optional("CORS_ORIGINS", "http://localhost:3000")
    .split(",")
    .map((o) => o.trim()),

  LOG_LEVEL: optional("LOG_LEVEL", "info"),

  ENABLE_GRAPHQL_INTROSPECTION: toBoolean(
    optional("ENABLE_GRAPHQL_INTROSPECTION", "false"),
  ),
};
