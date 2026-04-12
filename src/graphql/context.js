import { verifyToken } from "@/shared/utils/jwt";
import { getUserById } from "@/modules/auth/infrastructure/persistence/user.repository";

export async function createContext({ req, res }) {
  let user = null;

  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.cookies?.accessToken;

    if (token) {
      const decoded = verifyToken(token);
      user = await getUserById(decoded.id);
    }
  } catch (err) {
  }

  return {
    req,
    res,
    user,
    isAuthenticated: !!user,
  };
}
