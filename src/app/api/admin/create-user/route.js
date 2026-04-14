import connectDB from "@/shared/lib/db";
import { withRateLimit } from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";
import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";
import { validateSchema } from "@/shared/security/validators/schema.validator";

import { createUserSchema } from "@/modules/auth/interface/validation/createUser.schema";
import { createUserController } from "@/modules/auth/interface/http/admin.controller";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";
import { ROLES } from "@/shared/constants/roles";

const rateLimitConfig =
  process.env.NODE_ENV === "development"
    ? { limit: 1000, window: 60 }
    : { limit: 5, window: 60 };

const coreHandler = async (req) => {
  await connectDB();

  const rawBody = await req.json();

  const sanitized = sanitizeInput(rawBody);
  const validated = validateSchema(createUserSchema, sanitized);

  req.validatedBody = validated;

  return createUserController(req);
};

const handler = withRateLimit(
  withCsrf(authGuard(roleGuard(coreHandler, ROLES.SUPER_ADMIN))),
  {
    ...rateLimitConfig,
    prefix: "admin-create-user",
  },
);

export async function POST(req) {
  return handler(req);
}
