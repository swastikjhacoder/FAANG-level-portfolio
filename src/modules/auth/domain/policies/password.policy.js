export class PasswordPolicy {
  constructor(options = {}) {
    this.minLength = options.minLength || 8;
    this.maxLength = options.maxLength || 128;
    this.requireUppercase = options.requireUppercase ?? true;
    this.requireLowercase = options.requireLowercase ?? true;
    this.requireNumbers = options.requireNumbers ?? true;
    this.requireSpecialChars = options.requireSpecialChars ?? true;
    this.forbiddenPasswords = new Set(
      options.forbiddenPasswords || [
        "password",
        "12345678",
        "qwerty",
        "admin",
        "letmein",
      ],
    );
  }

  validate(password) {
    if (!password || typeof password !== "string") {
      throw new Error("Password is required");
    }

    if (password.length < this.minLength) {
      throw new Error(`Password must be at least ${this.minLength} characters`);
    }

    if (password.length > this.maxLength) {
      throw new Error(`Password must not exceed ${this.maxLength} characters`);
    }

    if (this.requireUppercase && !/[A-Z]/.test(password)) {
      throw new Error("Password must include at least one uppercase letter");
    }

    if (this.requireLowercase && !/[a-z]/.test(password)) {
      throw new Error("Password must include at least one lowercase letter");
    }

    if (this.requireNumbers && !/[0-9]/.test(password)) {
      throw new Error("Password must include at least one number");
    }

    if (this.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error("Password must include at least one special character");
    }

    if (this.forbiddenPasswords.has(password.toLowerCase())) {
      throw new Error("Password is too common");
    }

    return true;
  }

  getStrength(password) {
    let score = 0;

    if (!password) return score;

    if (password.length >= this.minLength) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    return score;
  }
}
