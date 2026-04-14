export const sanitizeStrings = (obj) => {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].trim();
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeStrings(obj[key]);
    }
  }
};
