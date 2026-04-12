export const roleGuard = (requiredRoles = []) => {
  return (user) => {
    if (!user || !user.roles) {
      throw new Error("Unauthorized");
    }

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new Error("Forbidden: Insufficient permissions");
    }

    return true;
  };
};
