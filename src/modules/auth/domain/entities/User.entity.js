import { Name } from "../valueObjects/Name.vo";
import { Email } from "../valueObjects/Email.vo";

export class User {
  constructor({
    id,
    email,
    name,
    roles,
    isVerified,
    isLocked,
    failedLoginAttempts,
    lastLoginAt,
    passwordChangedAt,
    mfaEnabled,
    deviceFingerprint,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.email = new Email(email).value;

    this.name = new Name(name);

    this.roles = roles || ["USER"];

    this.isVerified = isVerified || false;
    this.isLocked = isLocked || false;

    this.failedLoginAttempts = failedLoginAttempts || 0;
    this.lastLoginAt = lastLoginAt;

    this.passwordChangedAt = passwordChangedAt;

    this.mfaEnabled = mfaEnabled || false;

    this.deviceFingerprint = deviceFingerprint;

    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getDisplayName() {
    return this.name.displayName;
  }
}
