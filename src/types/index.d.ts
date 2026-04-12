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
    body?: any;
  }

  interface JwtPayload {
    userId: string;
    roles: string[];
    sessionVersion: number;
    iat?: number;
    exp?: number;
  }

  interface ApiResponse<T = any> {
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

      MONGODB_URL: string;

      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;

      REDIS_URL?: string;

      APP_URL?: string;
    }
  }
}
