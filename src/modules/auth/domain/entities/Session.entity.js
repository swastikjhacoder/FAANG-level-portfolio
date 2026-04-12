export class Session {
  constructor({
    id,
    userId,
    refreshTokenHash,
    userAgent,
    ip,
    expiresAt,
    isRevoked,
    rotatedFrom,
    createdAt,
  }) {
    this.id = id;
    this.userId = userId;

    this.refreshTokenHash = refreshTokenHash;

    this.userAgent = userAgent;
    this.ip = ip;

    this.expiresAt = expiresAt;
    this.isRevoked = isRevoked || false;

    this.rotatedFrom = rotatedFrom;

    this.createdAt = createdAt;
  }

  isExpired() {
    return new Date() > this.expiresAt;
  }
}
