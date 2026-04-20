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
  const index = ROLE_HIERARCHY.indexOf(role);
  return index === -1 ? -1 : index;
};

export const hasRole = (userRoles, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }

  return requiredRoles.some((role) => userRoles.includes(role));
};

export const hasAnyRole = (userRoles = [], roles = []) => {
  return roles.some((role) => isValidRole(role) && userRoles.includes(role));
};

export const hasAllRoles = (userRoles = [], roles = []) => {
  return roles.every((role) => isValidRole(role) && userRoles.includes(role));
};