export class ProfilePolicy {
  static isAdmin(user) {
    return (
      user &&
      Array.isArray(user.roles) &&
      user.roles.some((r) => ["ADMIN", "SUPER_ADMIN"].includes(r))
    );
  }

  static canCreate(user) {
    return this.isAdmin(user);
  }

  static canUpdate(user) {
    return this.isAdmin(user);
  }

  static canDelete(user) {
    return this.isAdmin(user);
  }

  static canView() {
    return true;
  }

  static assertAdmin(user) {
    if (!this.isAdmin(user)) {
      throw new Error("Forbidden");
    }
  }
}
