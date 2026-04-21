export const roleGuard = (handler, allowedRoles = []) => {
  return async (req) => {
    try {
      const userRoles = req.user?.roles || [];

      if (!allowedRoles || allowedRoles.length === 0) {
        return await handler(req);
      }

      const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

      if (!hasAccess) {
        return new Response("Forbidden", { status: 403 });
      }

      return await handler(req);
    } catch (err) {
      return new Response("Authorization error", { status: 403 });
    }
  };
};
