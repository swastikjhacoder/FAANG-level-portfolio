import xss from "xss";

export const sanitizeInput = (data) => {
  if (typeof data === "string") {
    return xss(data.trim());
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }

  if (typeof data === "object" && data !== null) {
    const sanitized = {};

    for (const key of Object.keys(data)) {
      sanitized[key] = sanitizeInput(data[key]);
    }

    return sanitized;
  }

  return data;
};
