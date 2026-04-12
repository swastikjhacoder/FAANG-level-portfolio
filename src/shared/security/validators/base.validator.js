export class ValidationError extends Error {
  constructor(message = "Validation failed", details = {}) {
    super(message);

    this.name = "ValidationError";
    this.statusCode = 400;
    this.details = details;
  }
}

export class BaseValidator {
  constructor(data = {}) {
    this.data = data;
    this.errors = {};
  }

  addError(field, message) {
    if (!this.errors[field]) {
      this.errors[field] = message;
    }
  }

  isRequired(field) {
    const value = this.data[field];

    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      this.addError(field, `${field} is required`);
    }
  }
  
  isEmail(field) {
    const value = this.data[field];

    if (!value) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      this.addError(field, "Invalid email format");
    }
  }

  minLength(field, length) {
    const value = this.data[field];

    if (!value) return;

    if (value.length < length) {
      this.addError(field, `${field} must be at least ${length} characters`);
    }
  }

  maxLength(field, length) {
    const value = this.data[field];

    if (!value) return;

    if (value.length > length) {
      this.addError(field, `${field} must be at most ${length} characters`);
    }
  }

  matches(field, regex, message = "Invalid format") {
    const value = this.data[field];

    if (!value) return;

    if (!regex.test(value)) {
      this.addError(field, message);
    }
  }

  isNumber(field) {
    const value = this.data[field];

    if (value === undefined || value === null) return;

    if (typeof value !== "number") {
      this.addError(field, `${field} must be a number`);
    }
  }

  isDate(field) {
    const value = this.data[field];

    if (!value) return;

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      this.addError(field, `${field} must be a valid date`);
    }
  }

  isEnum(field, allowedValues = []) {
    const value = this.data[field];

    if (!value) return;

    if (!allowedValues.includes(value)) {
      this.addError(
        field,
        `${field} must be one of [${allowedValues.join(", ")}]`,
      );
    }
  }

  custom(field, validatorFn, message = "Invalid value") {
    const value = this.data[field];

    if (!validatorFn(value, this.data)) {
      this.addError(field, message);
    }
  }

  validate() {
    if (Object.keys(this.errors).length > 0) {
      throw new ValidationError("Validation failed", this.errors);
    }

    return true;
  }
}
