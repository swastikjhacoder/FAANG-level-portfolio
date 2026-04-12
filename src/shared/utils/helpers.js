import mongoose from "mongoose";

export const isObject = (value) => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const isString = (value) => {
  return typeof value === "string";
};

export const isNumber = (value) => {
  return typeof value === "number" && !isNaN(value);
};

export const safeJsonParse = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const safeJsonStringify = (value, fallback = "") => {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
};

export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const toObjectId = (id) => {
  if (!isValidObjectId(id)) {
    throw new Error("Invalid ObjectId");
  }

  return new mongoose.Types.ObjectId(id);
};

export const pick = (obj, fields = []) => {
  const result = {};

  for (const key of fields) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
};

export const omit = (obj, fields = []) => {
  const result = { ...obj };

  for (const key of fields) {
    delete result[key];
  }

  return result;
};

export const deepClone = (obj) => {
  return structuredClone(obj);
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const generateRequestId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
};

export const toBoolean = (value) => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.toLowerCase());
  }

  return false;
};

export const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};
