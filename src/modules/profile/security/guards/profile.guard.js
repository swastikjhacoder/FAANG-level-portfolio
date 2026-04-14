import { ProfilePolicy } from "../../domain/policies/profile.policy.js";

export class ProfileGuard {
  static canCreate(user) {
    return ProfilePolicy.canCreate(user);
  }

  static canUpdate(user) {
    return ProfilePolicy.canUpdate(user);
  }

  static canDelete(user) {
    return ProfilePolicy.canDelete(user);
  }

  static canView() {
    return ProfilePolicy.canView();
  }

  static assertCreate(user) {
    if (!this.canCreate(user)) {
      throw new Error("Forbidden");
    }
  }

  static assertUpdate(user) {
    if (!this.canUpdate(user)) {
      throw new Error("Forbidden");
    }
  }

  static assertDelete(user) {
    if (!this.canDelete(user)) {
      throw new Error("Forbidden");
    }
  }

  static assertView() {
    if (!this.canView()) {
      throw new Error("Forbidden");
    }
  }
}
