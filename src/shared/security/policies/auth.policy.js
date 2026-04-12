import { ROLES, hasRole, hasAnyRole } from "@/shared/constants/roles";
export class AuthPolicy {
  constructor(user) {
    this.user = user;
  }

  isAuthenticated() {
    return !!this.user?.userId;
  }

  hasRole(requiredRole) {
    return hasRole(this.user?.roles || [], requiredRole);
  }

  hasAnyRole(roles = []) {
    return hasAnyRole(this.user?.roles || [], roles);
  }

  isSelf(targetUserId) {
    return this.user?.userId === targetUserId;
  }

  isAdmin() {
    return this.hasRole(ROLES.ADMIN);
  }

  isSuperAdmin() {
    return this.hasRole(ROLES.SUPER_ADMIN);
  }
}

export const requireAuth = (user) => {
  const policy = new AuthPolicy(user);

  if (!policy.isAuthenticated()) {
    throw new Error("Unauthorized");
  }

  return policy;
};

export const requireRole = (user, role) => {
  const policy = requireAuth(user);

  if (!policy.hasRole(role)) {
    throw new Error("Forbidden");
  }

  return policy;
};

export const requireAnyRole = (user, roles = []) => {
  const policy = requireAuth(user);

  if (!policy.hasAnyRole(roles)) {
    throw new Error("Forbidden");
  }

  return policy;
};

export const requireSelfOrAdmin = (user, targetUserId) => {
  const policy = requireAuth(user);

  if (!policy.isSelf(targetUserId) && !policy.isAdmin()) {
    throw new Error("Forbidden");
  }

  return policy;
};

export const requireSuperAdmin = (user) => {
  const policy = requireAuth(user);

  if (!policy.isSuperAdmin()) {
    throw new Error("Forbidden");
  }

  return policy;
};
