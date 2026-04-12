import { loginController } from "@/modules/auth/interface/http/auth.controller";
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      Vary: "Origin",
    },
  });
}

export async function POST(req) {
  const allowOrigin = resolveOrigin(req);

  if (!allowOrigin) {
    return new Response("CORS blocked", { status: 403 });
  }

  const response = await loginController(req);

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Credentials": "true",
      Vary: "Origin",
      "Content-Type": "application/json",
    },
  });
}
