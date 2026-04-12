import { verifyToken } from "@/shared/utils/jwt";
import * as UserRepo from "@/modules/auth/infrastructure/persistence/user.repository";

const parseCookies = (cookieHeader = "") => {
  if (!cookieHeader) return {};

  return Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [key, ...v] = c.trim().split("=");
      return [key, v.join("=")];
    }),
  );
};

export async function createContext({ request }) {
  let user = null;

  try {
    const authHeader = request.headers.get("authorization");

    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      const cookies = parseCookies(request.headers.get("cookie") || "");
      token = cookies.accessToken;
    }

    if (!token) {
      return {
        req: request,
        res: new Response(),
        user: null,
        isAuthenticated: false,
      };
    }

    const decoded = verifyToken(token);

    if (!decoded?.id) {
      throw new Error("Invalid token payload");
    }

    user = await UserRepo.getUserById(decoded.id);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Auth context error:", err.message);
    }
  }

  return {
    req: request,

    res: new Response(),

    user,
    isAuthenticated: !!user,
  };
}
