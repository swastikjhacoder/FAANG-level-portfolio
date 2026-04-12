export const sanitizeQuery = (query) => {
  if (!query || typeof query !== "object") return query;

  if (JSON.stringify(query).length > 10000) {
    throw new Error("🚫 Query too large");
  }

  const clean = (obj) => {
    for (const key of Object.keys(obj)) {
      if (key === "__proto__" || key === "constructor") {
        throw new Error("🚫 Prototype pollution attempt");
      }

      if (key.startsWith("$")) {
        throw new Error(`🚫 Mongo operator not allowed: ${key}`);
      }

      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        clean(obj[key]);
      }
    }
  };

  clean(query);
  return query;
};

export const sanitizeMongoQuery = (query) => {
  if (!query || typeof query !== "object") return query;

  const sanitized = {};

  for (const key of Object.keys(query)) {
    if (key.startsWith("$")) {
      throw new Error(`🚫 Mongo operator not allowed: ${key}`);
    }

    sanitized[key] = query[key];
  }

  return sanitized;
};