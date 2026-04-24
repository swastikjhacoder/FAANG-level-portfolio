export {};

declare global {
  interface AuthUser {
    userId: string;
    email: string;
    roles: string[];
    sessionVersion: number;
  }

  interface SafeUser {
    id: string;
    email: string;
    name: {
      firstName: string;
      lastName?: string;
      displayName?: string;
    };
    roles: string[];
  }

  interface Session {
    id: string;
    userId: string;
    userAgent?: string;
    ip?: string;
    expiresAt: Date;
    isRevoked: boolean;
    rotatedFrom?: string;
    createdAt?: Date;
  }

  interface RequestContext {
    user?: AuthUser;
    ip?: string;
    userAgent?: string;
    requestId?: string;
    body?: unknown;
  }

  interface JwtPayload {
    userId: string;
    roles: string[];
    sessionVersion: number;
    iat?: number;
    exp?: number;
  }

  interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string>;
  }

  interface AppError extends Error {
    statusCode?: number;
    details?: Record<string, string>;
  }

  interface PaginationQuery {
    page?: number;
    limit?: number;
    sort?: string;
  }

  interface PaginationResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
  }

  type ObjectId = string;

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";

      APP_URL: string;
      API_BASE_URL: string;

      MONGODB_URL: string;
      REDIS_URL?: string;

      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;

      ACCESS_TOKEN_EXPIRY: string;
      REFRESH_TOKEN_EXPIRY: string;

      BCRYPT_SALT_ROUNDS: string;

      ENCRYPTION_KEY: string;
      COOKIE_SECRET: string;

      TOKEN_PEPPER: string;
      PASSWORD_PEPPER: string;

      COOKIE_SECURE?: string;

      RATE_LIMIT_MAX?: string;
      RATE_LIMIT_WINDOW_MS?: string;

      CORS_ORIGIN?: string;

      LOG_LEVEL?: string;
      ENABLE_GRAPHQL_INTROSPECTION?: string;

      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASS: string;
      SMTP_FROM: string;

      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;

      VERCEL_URL?: string;
    }
  }
}
