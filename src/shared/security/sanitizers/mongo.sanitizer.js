export const sanitizeQuery = (query) => {
  if (!query || typeof query !== "object") return query;

  if (JSON.stringify(query).length > 10000) {
    throw new Error("🚫 Query too large");
  }

  const clean = (obj) => {
    for (const key in obj) {
      if (key === "__proto__" || key === "constructor") {
        throw new Error("🚫 Prototype pollution attempt");
      }

      if (key === "$where" || key === "$expr") {
        throw new Error(`🚫 Unsafe operator detected: ${key}`);
      }

      if (typeof obj[key] === "object") {
        clean(obj[key]);
      }
    }
  };

  clean(query);
  return query;
};
