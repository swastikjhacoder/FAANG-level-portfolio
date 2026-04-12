import { corsOptions } from "@/shared/config/cors";
import yoga from "@/graphql/server";

const resolveOrigin = (req) => {
  const origin = req.headers.get("origin");
  const allowedOrigins = corsOptions.origin;

  if (!origin || !allowedOrigins.includes(origin)) {
    return null;
  }

  return origin;
};

const withCors = (req, handler) => {
  return async () => {
    const allowOrigin = resolveOrigin(req);

    if (!allowOrigin) {
      return new Response("CORS blocked", { status: 403 });
    }

    const response = await handler(req);

    const newHeaders = new Headers(response.headers);

    newHeaders.set("Access-Control-Allow-Origin", allowOrigin);
    newHeaders.set("Access-Control-Allow-Credentials", "true");
    newHeaders.set("Vary", "Origin");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
};

export async function OPTIONS(req) {
  const allowOrigin = resolveOrigin(req);

  if (!allowOrigin) {
    return new Response("CORS blocked", { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      Vary: "Origin",
    },
  });
}

export const GET = (req) => withCors(req, yoga)(req);
export const POST = (req) => withCors(req, yoga)(req);
