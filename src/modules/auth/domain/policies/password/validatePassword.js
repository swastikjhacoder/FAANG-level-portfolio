import { PasswordPolicy } from "../password.policy";


const policy = new PasswordPolicy();

export function validatePassword(password) {
  return policy.validate(password);
}

export function getPasswordStrength(password) {
  return policy.getStrength(password);
}
