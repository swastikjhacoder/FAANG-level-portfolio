import { isEmail } from "validator";

export class LoginDTO {
  constructor({ email, password }) {
    if (!email || typeof email !== "string") {
      throw new Error("Email is required");
    }

    if (!isEmail(email)) {
      throw new Error("Invalid email format");
    }

    this.email = email;
    
    if (!password || typeof password !== "string") {
      throw new Error("Password is required");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    this.password = password;
  }
}
