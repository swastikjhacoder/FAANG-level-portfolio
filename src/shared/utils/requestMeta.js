import xss from "xss";

export const extractRequestMeta = (req) => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");

  const rawIp = realIp || forwardedFor || "";

  const ip = rawIp ? rawIp.split(",")[0].trim() : null;

  const userAgent = req.headers.get("user-agent") || "";

  const deviceFingerprint = req.headers.get("x-device-id") || userAgent;

  return {
    ip,
    userAgent,
    deviceFingerprint,
  };
};
