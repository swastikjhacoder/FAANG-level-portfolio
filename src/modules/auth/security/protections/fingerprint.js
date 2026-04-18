import crypto from "crypto";
import xss from "xss";

const HASH_ALGO = "sha256";

const extractFingerprintData = (req) => {
  const headers = req.headers;

  const ip = headers.get("x-real-ip") || headers.get("x-forwarded-for") || "";

  const userAgent = headers.get("user-agent") || "";
  const acceptLang = headers.get("accept-language") || "";
  const platform = headers.get("sec-ch-ua-platform") || "";

  return {
    ip: xss(ip.split(",")[0].trim()),
    userAgent: xss(userAgent),
    acceptLang: xss(acceptLang),
    platform: xss(platform),
  };
};

const buildFingerprintString = (data) => {
  return [data.ip, data.userAgent, data.acceptLang, data.platform].join("|");
};

const hashFingerprint = (fingerprintString) => {
  return crypto.createHash(HASH_ALGO).update(fingerprintString).digest("hex");
};

export const generateFingerprint = (req) => {
  if (!req || !req.headers) {
    throw new Error("Invalid request object");
  }

  const data = extractFingerprintData(req);
  const fingerprintString = buildFingerprintString(data);

  return hashFingerprint(fingerprintString);
};

export const compareFingerprint = (fp1, fp2) => {
  if (!fp1 || !fp2 || typeof fp1 !== "string" || typeof fp2 !== "string") {
    return false;
  }

  try {
    const buf1 = Buffer.from(fp1, "hex");
    const buf2 = Buffer.from(fp2, "hex");

    if (buf1.length !== buf2.length) return false;

    return crypto.timingSafeEqual(buf1, buf2);
  } catch {
    return false;
  }
};
