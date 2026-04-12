export class Password {
  constructor(password) {
    if (!password || password.length < 8) {
      throw new Error("Weak password");
    }

    if (!/[A-Z]/.test(password)) throw new Error("Missing uppercase");
    if (!/[a-z]/.test(password)) throw new Error("Missing lowercase");
    if (!/[0-9]/.test(password)) throw new Error("Missing number");
    if (!/[!@#$%^&*]/.test(password)) throw new Error("Missing special char");

    this.value = password;
  }
}
