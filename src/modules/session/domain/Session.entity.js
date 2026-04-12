export class Session {
  constructor({
    id,
    userId,
    refreshTokenHash,
    userAgent,
    ip,
    fingerprint,
    expiresAt,
    isRevoked,
    rotatedFrom,
    lastUsedAt,
    createdAt,
  }) {
    if (!userId) {
      throw new Error("Session must have a userId");
    }

    if (!refreshTokenHash) {
      throw new Error("Session must have a refreshTokenHash");
    }

    if (!expiresAt) {
      throw new Error("Session must have an expiry date");
    }

    this.id = id;
    this.userId = userId;

    this.refreshTokenHash = refreshTokenHash;

    this.userAgent = userAgent || "";
    this.ip = ip || "";

    this.fingerprint = fingerprint || null;

    this.expiresAt = new Date(expiresAt);

    this.isRevoked = isRevoked || false;

    this.rotatedFrom = rotatedFrom || null;

    this.lastUsedAt = lastUsedAt || null;

    this.createdAt = createdAt || new Date();
  }

  isExpired() {
    return new Date() > this.expiresAt;
  }

  isActive() {
    return !this.isRevoked && !this.isExpired();
  }

  revoke() {
    this.isRevoked = true;
    this.revokedAt = new Date();
  }

  rotate(newSessionId) {
    this.isRevoked = true;
    this.rotatedTo = newSessionId;
  }

  touch() {
    this.lastUsedAt = new Date();
  }

  isSameDevice(fingerprint) {
    if (!this.fingerprint) return true;
    return this.fingerprint === fingerprint;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      userAgent: this.userAgent,
      ip: this.ip,
      fingerprint: this.fingerprint,
      expiresAt: this.expiresAt,
      isRevoked: this.isRevoked,
      rotatedFrom: this.rotatedFrom,
      lastUsedAt: this.lastUsedAt,
      createdAt: this.createdAt,
    };
  }
}
