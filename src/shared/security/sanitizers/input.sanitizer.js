import { ValidationError } from "@/shared/errors";
import xss from "xss";

const isSafeKey = (key) => {
  return (
    key !== "__proto__" &&
    key !== "constructor" &&
    key !== "prototype" &&
    !key.startsWith("$") &&
    !key.includes(".")
  );
};

const MAX_DEPTH = 10;

export const sanitizeInput = (data, depth = 0) => {
  if (depth > MAX_DEPTH) {
    throw new ValidationError("Payload too deeply nested");
  }

  if (typeof data === "string") {
    return xss(data.trim());
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeInput(item, depth + 1));
  }

  if (typeof data === "object" && data !== null) {
    if (
      data instanceof Date ||
      data instanceof Buffer ||
      data._bsontype === "ObjectID"
    ) {
      return data;
    }

    const sanitized = {};

    for (const key of Object.keys(data)) {
      if (!isSafeKey(key)) {
        throw new ValidationError(`Invalid key detected: ${key}`);
      }

      sanitized[key] = sanitizeInput(data[key], depth + 1);
    }

    return sanitized;
  }

  return data;
};
