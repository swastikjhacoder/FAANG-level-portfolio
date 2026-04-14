import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("❌ ACCESS_TOKEN_SECRET is not defined");
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error("❌ REFRESH_TOKEN_SECRET is not defined");
}

const generateJTI = () => crypto.randomUUID();

export const generateAccessToken = (payload) => {
  console.log("SIGN SECRET:", process.env.ACCESS_TOKEN_SECRET);
  return jwt.sign(
    {
      userId: payload.userId,
      roles: payload.roles,
      sessionVersion: payload.sessionVersion,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      jwtid: generateJTI(),
    },
  );
};

export const verifyAccessToken = (token) => {
  console.log("VERIFY SECRET:", process.env.ACCESS_TOKEN_SECRET);
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    throw new Error("Invalid or expired access token");
  }
};

export const generateRefreshToken = (payload) => {
  const tokenPayload = {
    userId: payload.userId,
    sessionVersion: payload.sessionVersion,
  };

  return jwt.sign(tokenPayload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    jwtid: generateJTI(),
  });
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

export const extractJTI = (token) => {
  const decoded = jwt.decode(token);
  return decoded?.jti;
};
