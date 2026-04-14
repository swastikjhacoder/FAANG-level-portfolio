const dangerousKeys = ["__proto__", "constructor", "prototype"];

export const sanitizeStrings = (obj, seen = new WeakSet()) => {
  if (obj === null || typeof obj !== "object") {
    return typeof obj === "string" ? obj.trim() : obj;
  }

  if (seen.has(obj)) return obj;
  seen.add(obj);

  if (
    obj instanceof Date ||
    obj instanceof RegExp ||
    obj instanceof Buffer ||
    obj._bsontype === "ObjectId"
  ) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeStrings(item, seen));
  }

  const result = {};

  for (const key of Object.keys(obj)) {
    if (dangerousKeys.includes(key)) continue;

    result[key] = sanitizeStrings(obj[key], seen);
  }

  return result;
};
