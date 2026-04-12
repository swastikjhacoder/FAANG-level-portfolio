export const sanitizeMongoQuery = (query) => {
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

      const value = obj[key];

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        clean(value);
      }

      if (typeof value === "string") {
        obj[key] = value.trim();
      }
    }
  };

  clean(query);
  return query;
};
