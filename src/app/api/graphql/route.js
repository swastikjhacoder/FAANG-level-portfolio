export const runtime = "nodejs";

import { corsOptions } from "@/shared/config/cors";
import { getYoga } from "@/graphql/server";
// ⚠️ keep middleware out for now; re-add later after build is stable
// import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";

const resolveOrigin = (req) => {
  const origin = req.headers.get("origin");
  const allowedOrigins = corsOptions.origin;

  if (!origin) return allowedOrigins[0];
  if (allowedOrigins.includes(origin)) return origin;

  return null;
};

const buildCorsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  Vary: "Origin",
});

const handler = async (req) => {
  const yoga = await getYoga();
  return yoga.fetch(req);
};

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
  Object.entries(buildCorsHeaders(allowOrigin)).forEach(([k, v]) => {
    headers.set(k, v);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const GET = (req) => withCors(req);
export const POST = (req) => withCors(req);
