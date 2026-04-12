import { isEmail } from "validator";

export class RegisterDTO {
  constructor({ email, password, firstName, lastName }) {
    if (!email || !isEmail(email)) {
      throw new Error("Invalid email");
    }

    this.email = email;

    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) throw new Error("Password needs uppercase");
    if (!/[a-z]/.test(password)) throw new Error("Password needs lowercase");
    if (!/[0-9]/.test(password)) throw new Error("Password needs number");
    if (!/[!@#$%^&*]/.test(password))
      throw new Error("Password needs special char");

    this.password = password;

    if (!firstName || firstName.trim().length < 2) {
      throw new Error("Invalid first name");
    }

    this.name = {
      firstName: firstName.trim(),
      lastName: lastName?.trim() || "",
    };
  }
}
