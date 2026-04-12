import xss from "xss";

export const extractRequestMeta = (req) => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");

  const rawIp = realIp || forwardedFor || "";

  const ip = xss(rawIp.split(",")[0].trim());

  const userAgent = xss(req.headers.get("user-agent") || "");

  return {
    ip,
    userAgent,
  };
};
