import { corsOptions } from "@/shared/config/cors";

const resolveOrigin = (req) => {
  const origin = req.headers.get("origin");
  const allowedOrigins = corsOptions.origin;

  if (!origin || !allowedOrigins.includes(origin)) {
    return null;
  }

  return origin;
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
      "Vary": "Origin",
    },
  });
}

export async function POST(req) {
  const allowOrigin = resolveOrigin(req);

  if (!allowOrigin) {
    return new Response("CORS blocked", { status: 403 });
  }

  const response = await handleGraphQL(req);

  return new Response(response.body, {
    headers: {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Vary": "Origin",
      "Content-Type": "application/json",
    },
  });
}
