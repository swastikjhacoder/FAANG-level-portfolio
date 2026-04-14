import xss from "xss";

export const cleanString = (value) => {
  if (typeof value !== "string") return value;
  return xss(value.trim());
};

export const cleanArray = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return arr.map(cleanString);
};

export const cleanObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const result = {};
  for (const key in obj) {
    const value = obj[key];

    if (typeof value === "string") {
      result[key] = cleanString(value);
    } else if (typeof value === "object") {
      result[key] = cleanObject(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};
