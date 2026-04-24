import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET missing");
}

const generateJTI = () => crypto.randomUUID();

export const signAccessToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      roles: payload.roles,
      sessionVersion: payload.sessionVersion,
      sessionId: payload.sessionId,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      jwtid: generateJTI(),
    },
  );
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (err) {
    console.error("JWT VERIFY ERROR:", err.message);
    throw new Error("Invalid or expired access token");
  }
};

export const decodeToken = (token) => jwt.decode(token);

export const extractJTI = (token) => {
  const decoded = jwt.decode(token);
  return decoded?.jti;
};
