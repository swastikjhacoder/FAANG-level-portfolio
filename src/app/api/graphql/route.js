import { corsOptions } from "@/shared/config/cors";
import yoga from "@/graphql/server";
import { withRateLimit } from "@/shared/middleware/rateLimit.middleware";

const resolveOrigin = (req) => {
  const origin = req.headers.get("origin");
  const allowedOrigins = corsOptions.origin;

  if (!origin || !allowedOrigins.includes(origin)) {
    return null;
  }

  return origin;
};

const buildCorsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  Vary: "Origin",
});

const handler = withRateLimit(
  async (req) => {
    return await yoga(req);
  },
  { limit: 100, window: 60, prefix: "graphql" },
);

export async function OPTIONS(req) {
  const allowOrigin = resolveOrigin(req);

  if (!allowOrigin) {
    return new Response("CORS blocked", { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(allowOrigin),
  });
}

const withCors = async (req) => {
  const allowOrigin = resolveOrigin(req);

  if (!allowOrigin) {
    return new Response("CORS blocked", { status: 403 });
  }

  const response = await handler(req);

  const headers = new Headers(response.headers);

  Object.entries(buildCorsHeaders(allowOrigin)).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const GET = (req) => withCors(req);
export const POST = (req) => withCors(req);
