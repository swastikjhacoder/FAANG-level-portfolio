import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("JWT secrets are not defined");
}

const ISSUER = "swastikjha.com";
const AUDIENCE = "user";

export const signAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
    issuer: ISSUER,
    audience: AUDIENCE,
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
  } catch (err) {
    throw new Error("Invalid or expired access token");
  }
};

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
    issuer: ISSUER,
    audience: AUDIENCE,
  });
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
};

export const extractBearerToken = (req) => {
  const authHeader =
    req.headers.get?.("authorization") || req.headers.authorization;

  if (!authHeader) return null;

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};
