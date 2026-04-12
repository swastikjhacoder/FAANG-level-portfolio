import logger from "@/shared/lib/logger";
import { trackSecurityEvent } from "@/shared/lib/monitoring";

const SENSITIVE_KEYS = [
  "password",
  "passwordHash",
  "refreshToken",
  "accessToken",
  "mfaSecret",
];

const sanitize = (data = {}) => {
  const sanitized = {};

  for (const key of Object.keys(data)) {
    if (SENSITIVE_KEYS.includes(key)) {
      sanitized[key] = "***REDACTED***";
    } else if (typeof data[key] === "object" && data[key] !== null) {
      sanitized[key] = sanitize(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  }

  return sanitized;
};

class AuditLogger {
  async log({
    action,
    userId = null,
    email = null,
    ip = null,
    userAgent = null,
    metadata = {},
    status = "SUCCESS",
  }) {
    const payload = sanitize({
      action,
      userId,
      email,
      ip,
      userAgent,
      status,
      metadata,
      timestamp: new Date().toISOString(),
    });

    logger.info("AUDIT_LOG", payload);
    
    if (status === "FAILED" || action.includes("FAILED")) {
      trackSecurityEvent({
        type: action,
        userId,
        ip,
        userAgent,
        metadata,
      });
    }
  }

  async loginSuccess(data) {
    return this.log({
      ...data,
      action: "LOGIN_SUCCESS",
      status: "SUCCESS",
    });
  }

  async loginFailed(data) {
    return this.log({
      ...data,
      action: "LOGIN_FAILED",
      status: "FAILED",
    });
  }

  async registerSuccess(data) {
    return this.log({
      ...data,
      action: "REGISTER_SUCCESS",
      status: "SUCCESS",
    });
  }

  async registerFailed(data) {
    return this.log({
      ...data,
      action: "REGISTER_FAILED",
      status: "FAILED",
    });
  }

  async logout(data) {
    return this.log({
      ...data,
      action: "LOGOUT",
      status: "SUCCESS",
    });
  }

  async tokenReuseDetected(data) {
    return this.log({
      ...data,
      action: "TOKEN_REUSE_DETECTED",
      status: "FAILED",
    });
  }

  async accountLocked(data) {
    return this.log({
      ...data,
      action: "ACCOUNT_LOCKED",
      status: "FAILED",
    });
  }

  async passwordChanged(data) {
    return this.log({
      ...data,
      action: "PASSWORD_CHANGED",
      status: "SUCCESS",
    });
  }

  async roleChanged(data) {
    return this.log({
      ...data,
      action: "ROLE_CHANGED",
    });
  }

  async userDeleted(data) {
    return this.log({
      ...data,
      action: "USER_DELETED",
    });
  }
}

const auditLogger = new AuditLogger();

export default auditLogger;
