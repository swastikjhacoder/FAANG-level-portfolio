const dangerousKeys = ["__proto__", "constructor", "prototype"];

export const sanitizeStrings = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeStrings);
  }

  if (obj && typeof obj === "object") {
    const result = {};

    for (const key in obj) {
      if (dangerousKeys.includes(key)) continue;

      result[key] = sanitizeStrings(obj[key]);
    }

    return result;
  }

  if (typeof obj === "string") {
    return obj.trim();
  }

  return obj;
};
