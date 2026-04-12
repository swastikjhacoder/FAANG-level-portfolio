import { redisIncr, redisExpire, redisGet } from "@/shared/lib/redis";
import { trackSecurityEvent } from "@/shared/lib/monitoring";
import xss from "xss";

const DEFAULT_LIMIT = 100;
const DEFAULT_WINDOW = 60;

const getKey = (req, prefix = "rate") => {
  const rawIp =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const ip = xss(rawIp);

  return `${prefix}:${ip}`;
};

const checkRateLimit = async ({ key, limit, window }) => {
  const current = await redisIncr(key);

  if (current === 1) {
    await redisExpire(key, window);
  }

  return {
    current,
    remaining: Math.max(limit - current, 0),
    blocked: current > limit,
  };
};

export const withRateLimit = (handler, options = {}) => {
  const {
    limit = DEFAULT_LIMIT,
    window = DEFAULT_WINDOW,
    prefix = "rate",
  } = options;

  return async (req, context = {}) => {
    const key = getKey(req, prefix);

    try {
      const { current, remaining, blocked } = await checkRateLimit({
        key,
        limit,
        window,
      });

      if (blocked) {
        trackSecurityEvent({
          type: "RATE_LIMIT_EXCEEDED",
          ip: key,
          metadata: { current, limit },
        });

        return new Response(
          JSON.stringify({
            success: false,
            message: "Too many requests",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": window.toString(),
            },
          },
        );
      }

      const response = await handler(req, context);

      if (response instanceof Response) {
        response.headers.set("X-RateLimit-Limit", limit.toString());
        response.headers.set("X-RateLimit-Remaining", remaining.toString());
      }

      return response;
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Rate limiter error",
        }),
        { status: 500 },
      );
    }
  };
};
