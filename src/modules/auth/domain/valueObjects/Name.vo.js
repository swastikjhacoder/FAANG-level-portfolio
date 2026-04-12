const NAME_REGEX = /^[a-zA-Z\s'-]+$/;

export class Name {
  constructor({ firstName, lastName, displayName }) {
    if (!firstName || firstName.length < 2) {
      throw new Error("Invalid first name");
    }

    if (!NAME_REGEX.test(firstName)) {
      throw new Error("First name contains invalid characters");
    }

    if (lastName && !NAME_REGEX.test(lastName)) {
      throw new Error("Last name contains invalid characters");
    }

    this.firstName = firstName;
    this.lastName = lastName || "";
    this.displayName = displayName || `${firstName} ${lastName || ""}`.trim();
  }
}
