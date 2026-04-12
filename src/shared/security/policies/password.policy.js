const COMMON_PASSWORDS = new Set([
  "123456",
  "password",
  "12345678",
  "qwerty",
  "abc123",
  "111111",
  "123123",
  "password1",
]);

export class PasswordPolicy {
  constructor(password) {
    this.password = password;
  }

  validate() {
    if (!this.password || typeof this.password !== "string") {
      throw new Error("Password is required");
    }

    if (this.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    if (this.password.length > 128) {
      throw new Error("Password too long");
    }

    if (!/[A-Z]/.test(this.password)) {
      throw new Error("Password must contain uppercase letter");
    }

    if (!/[a-z]/.test(this.password)) {
      throw new Error("Password must contain lowercase letter");
    }

    if (!/[0-9]/.test(this.password)) {
      throw new Error("Password must contain number");
    }

    if (!/[!@#$%^&*]/.test(this.password)) {
      throw new Error("Password must contain special character");
    }

    if (COMMON_PASSWORDS.has(this.password.toLowerCase())) {
      throw new Error("Password is too common");
    }

    return true;
  }

  getStrengthScore() {
    let score = 0;

    if (this.password.length >= 8) score++;
    if (this.password.length >= 12) score++;

    if (/[A-Z]/.test(this.password)) score++;
    if (/[a-z]/.test(this.password)) score++;
    if (/[0-9]/.test(this.password)) score++;
    if (/[!@#$%^&*]/.test(this.password)) score++;

    if (!COMMON_PASSWORDS.has(this.password.toLowerCase())) score++;

    return score;
  }

  getStrengthLabel() {
    const score = this.getStrengthScore();

    if (score <= 2) return "WEAK";
    if (score <= 4) return "MEDIUM";
    if (score <= 6) return "STRONG";
    return "VERY_STRONG";
  }

  isSameAs(oldPassword) {
    return this.password === oldPassword;
  }
}
