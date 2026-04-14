import { hasRole } from "@/shared/constants/roles";

export const roleGuard = (handler, requiredRole) => {
  return async (req) => {
    const user = req.user;

    if (!hasRole(user.roles, requiredRole)) {
      return new Response("Forbidden", { status: 403 });
    }

    return handler(req);
  };
};
