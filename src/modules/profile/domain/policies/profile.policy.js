import { ForbiddenError } from "@/shared/errors";

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

  static assertCanCreate(user) {
    if (!this.canCreate(user)) {
      throw new ForbiddenError("You are not allowed to create profiles");
    }
  }

  static assertCanUpdate(user) {
    if (!this.canUpdate(user)) {
      throw new ForbiddenError("You are not allowed to update profiles");
    }
  }

  static assertCanDelete(user) {
    if (!this.canDelete(user)) {
      throw new ForbiddenError("You are not allowed to delete profiles");
    }
  }

  static assertCanView(user) {
    if (!this.canView(user)) {
      throw new ForbiddenError("You are not allowed to view profiles");
    }
  }

  static assertCanModifyProfile(user, profile) {
    if (!user) {
      throw new ForbiddenError("Unauthorized");
    }

    if (this.isAdmin(user)) return;

    const isOwner = profile?.userId && profile.userId.toString() === user.id;

    if (!isOwner) {
      throw new ForbiddenError("Access denied to this profile");
    }
  }
}
