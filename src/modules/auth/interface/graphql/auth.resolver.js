import { LoginUseCase } from "../../application/useCases/login.usecase";
import { RegisterUseCase } from "../../application/useCases/register.usecase";
import { RefreshTokenUseCase } from "../../application/useCases/refreshToken.usecase";
import { LogoutUseCase } from "../../application/useCases/logout.usecase";

import { extractRequestMeta } from "@/shared/utils/requestMeta";

const COOKIE_NAME = "refreshToken";

const buildCookie = (value, options = {}) => {
  const parts = [`${COOKIE_NAME}=${value}`];

  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);

  return parts.join("; ");
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export const authResolvers = {
  Mutation: {
    register: async (_, args, context) => {
      try {
        const { req } = context;

        const { ip, userAgent } = extractRequestMeta(req);

        const useCase = new RegisterUseCase();

        const user = await useCase.execute(args.input, {
          ip,
          userAgent,
        });

        return {
          success: true,
          user,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    },

    login: async (_, args, context) => {
      try {
        const { req, res } = context;

        const { ip, userAgent } = extractRequestMeta(req);

        const useCase = new LoginUseCase();

        const result = await useCase.execute(args.input, {
          ip,
          userAgent,
        });

        const cookie = buildCookie(result.refreshToken, COOKIE_OPTIONS);

        res.headers.append("Set-Cookie", cookie);

        return {
          success: true,
          user: result.user,
          accessToken: result.accessToken,
          sessionId: result.sessionId,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    },

    refreshToken: async (_, __, context) => {
      try {
        const { req, res } = context;

        const cookieHeader = req.headers.get("cookie") || "";
        const refreshToken = cookieHeader
          .split("; ")
          .find((c) => c.startsWith(`${COOKIE_NAME}=`))
          ?.split("=")[1];

        if (!refreshToken) {
          throw new Error("Unauthorized");
        }

        const { ip, userAgent } = extractRequestMeta(req);

        const useCase = new RefreshTokenUseCase();

        const result = await useCase.execute(refreshToken, {
          ip,
          userAgent,
        });

        const cookie = buildCookie(result.refreshToken, COOKIE_OPTIONS);

        res.headers.append("Set-Cookie", cookie);

        return {
          success: true,
          accessToken: result.accessToken,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    },

    logout: async (_, args, context) => {
      try {
        const { req, res } = context;

        const { ip, userAgent } = extractRequestMeta(req);

        const useCase = new LogoutUseCase();

        await useCase.execute(
          {
            sessionId: args?.sessionId,
            userId: args?.userId,
            logoutAll: args?.logoutAll || false,
          },
          { ip, userAgent },
        );

        const cookie = buildCookie("", {
          path: "/",
          expires: new Date(0),
        });

        res.headers.append("Set-Cookie", cookie);

        return {
          success: true,
          message: "Logged out successfully",
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
  },
};
