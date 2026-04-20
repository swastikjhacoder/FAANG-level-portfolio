import { hasRole } from "@/shared/constants/roles";
import { NextResponse } from "next/server";

export const roleGuard = (handler, allowedRoles = []) => {
  return async (req) => {
    try {
      const userRoles = req.user?.roles || [];

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