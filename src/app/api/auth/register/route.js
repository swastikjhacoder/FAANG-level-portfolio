import { registerController } from "@/modules/auth/interface/http/auth.controller";
import { corsOptions } from "@/shared/config/cors";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";
import { withRateLimit } from "@/shared/security/middleware/rateLimit.middleware";
import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";
import { validateSchema } from "@/shared/security/validators/schema.validator";
import { registerSchema } from "@/modules/auth/interface/validation/register.schema";
import connectDB from "@/shared/lib/db";

const resolveOrigin = (req) => {
  const origin = req.headers.get("origin");
  const allowedOrigins = corsOptions.origin;

  if (!origin) {
    return allowedOrigins[0];
  }

  if (allowedOrigins.includes(origin)) {
    return origin;
  }

  return null;
};

const buildCorsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  Vary: "Origin",
});

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

const handler = withRateLimit(
  withCsrf(async (req) => {
    await connectDB();
    const rawBody = await req.json();

    const sanitizedBody = sanitizeInput(rawBody);

    const validatedBody = validateSchema(registerSchema, sanitizedBody);

    const newReq = new Request(req.url, {
      method: req.method,
      headers: req.headers,
      body: JSON.stringify(validatedBody),
    });

    return await registerController(newReq);
  }),
  { limit: 5, window: 60, prefix: "register" },
);

export async function POST(req) {
  const allowOrigin = resolveOrigin(req);

  if (!allowOrigin) {
    return new Response("CORS blocked", { status: 403 });
  }

  const controllerResponse = await handler(req);

  const body = await controllerResponse.text();

  const headers = new Headers(controllerResponse.headers);

  Object.entries(buildCorsHeaders(allowOrigin)).forEach(([key, value]) => {
    headers.set(key, value);
  });

  headers.set("Content-Type", "application/json");

  return new Response(body, {
    status: controllerResponse.status,
    headers,
  });
}
