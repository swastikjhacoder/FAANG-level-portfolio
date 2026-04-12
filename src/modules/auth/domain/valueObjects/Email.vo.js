import { isEmail } from "validator";

export class Email {
  constructor(email) {
    if (!email || !isEmail(email)) {
      throw new Error("Invalid email");
    }

    this.value = email.trim().toLowerCase();
  }
}
