export const ROLES = Object.freeze({
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
  USER: "USER",
});

export const ROLE_HIERARCHY = [
  ROLES.USER,
  ROLES.MODERATOR,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
];

export const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

export const getRoleLevel = (role) => {
  return ROLE_HIERARCHY.indexOf(role);
};

export const hasRole = (userRoles = [], requiredRole) => {
  if (!requiredRole) return true;

  const requiredLevel = getRoleLevel(requiredRole);

  return userRoles.some((role) => getRoleLevel(role) >= requiredLevel);
};

export const hasAnyRole = (userRoles = [], roles = []) => {
  return roles.some((role) => userRoles.includes(role));
};

export const hasAllRoles = (userRoles = [], roles = []) => {
  return roles.every((role) => userRoles.includes(role));
};
