import { cookies } from "next/headers";

import { LoginUseCase } from "../../application/useCases/login.usecase";
import { RegisterUseCase } from "../../application/useCases/register.usecase";
import { RefreshTokenUseCase } from "../../application/useCases/refreshToken.usecase";
import { LogoutUseCase } from "../../application/useCases/logout.usecase";

import { extractRequestMeta } from "@/shared/utils/requestMeta";

const COOKIE_NAME = "refreshToken";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
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
        const { req } = context;

        const { ip, userAgent } = extractRequestMeta(req);

        const useCase = new LoginUseCase();

        const result = await useCase.execute(args.input, {
          ip,
          userAgent,
        });

        const cookieStore = cookies();
        cookieStore.set(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

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
        const { req } = context;

        const cookieStore = cookies();
        const refreshToken = cookieStore.get(COOKIE_NAME)?.value;

        if (!refreshToken) {
          throw new Error("Unauthorized");
        }

        const { ip, userAgent } = extractRequestMeta(req);

        const useCase = new RefreshTokenUseCase();

        const result = await useCase.execute(refreshToken, {
          ip,
          userAgent,
        });

        cookieStore.set(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);

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
        const { req } = context;

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

        const cookieStore = cookies();
        cookieStore.set(COOKIE_NAME, "", {
          httpOnly: true,
          path: "/",
          expires: new Date(0),
        });

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
