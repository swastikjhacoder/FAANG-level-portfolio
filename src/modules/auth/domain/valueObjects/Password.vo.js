import { PasswordPolicy } from "@/shared/security/policies/password.policy";

export class Password {
  constructor(password) {
    const policy = new PasswordPolicy(password);
    policy.validate();

    this.value = password;
  }
}
