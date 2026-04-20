import mongoose from "mongoose";
import { verifyAccessToken } from "@/shared/utils/jwt";

export const isObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isString = (value) => typeof value === "string";

export const isNumber = (value) => typeof value === "number" && !isNaN(value);

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

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const toObjectId = (id) => {
  if (!isValidObjectId(id)) {
    throw new Error("Invalid ObjectId");
  }
  return new mongoose.Types.ObjectId(id);
};

export const pick = (obj, fields = []) => {
  const result = {};
  for (const key of fields) {
    if (key in obj) result[key] = obj[key];
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

export const deepClone = (obj) => structuredClone(obj);

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateRequestId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 10);

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

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const getCookieFromRequest = (req, name) => {
  const cookieHeader = req.headers.get("cookie") || "";

  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const [key, ...v] = c.split("=");
        return [key, v.join("=")];
      }),
  );

  return cookies[name];
};

export async function getUserFromRequest(req) {
  try {
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");

    let token = null;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      token = getCookieFromRequest(req, "accessToken");
    }

    if (!token) return null;

    const payload = verifyAccessToken(token);

    return {
      userId: payload.userId,
      roles: payload.roles || [],
      sessionVersion: payload.sessionVersion,
    };
  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    return null;
  }
}
