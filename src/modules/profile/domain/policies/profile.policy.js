export class ProfilePolicy {
  static canCreate(user) {
    return user && ["ADMIN", "SUPER_ADMIN"].includes(user.role);
  }

  static canUpdate(user) {
    return user && ["ADMIN", "SUPER_ADMIN"].includes(user.role);
  }

  static canDelete(user) {
    return user && ["ADMIN", "SUPER_ADMIN"].includes(user.role);
  }

  static canView() {
    return true;
  }

  static assertAdmin(user) {
    if (!this.canCreate(user)) {
      throw new Error("Forbidden");
    }
  }
}
