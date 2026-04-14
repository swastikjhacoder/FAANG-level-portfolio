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

  const result = {};
  for (const key in obj) {
    result[key] =
      typeof obj[key] === "string" ? cleanString(obj[key]) : obj[key];
  }
  return result;
};
