import connectDB from "@/shared/lib/db";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

import { UpsertSoftSkillSectionUseCase } from "@/modules/profile/application/useCases/upsertSoftSkillSection.usecase";
import { SoftSkillSectionRepository } from "@/modules/profile/infrastructure/persistence/softSkillSection.repository";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import auditLogger from "@/shared/security/audit/audit.logger";

const repo = new SoftSkillSectionRepository();
const upsertUC = new UpsertSoftSkillSectionUseCase(repo);

const DEV = process.env.NODE_ENV === "development";
const ADMIN = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

const ok = (data) => Response.json({ success: true, data });

const fail = (error) =>
  Response.json(
    {
      success: false,
      message:
        error?.code === "BAD_USER_INPUT"
          ? error.message
          : "Internal Server Error",
      code: error.code || "INTERNAL_ERROR",
    },
    { status: error.status || 500 },
  );

const createHandler = async (req) => {
  try {
    await connectDB();

    const body = sanitizeInput(await req.json());

    const result = await upsertUC.execute(body);

    auditLogger.log({
      action: "SOFT_SKILL_SECTION_UPSERT",
      userId: req.user.userId,
    });

    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const getHandler = async () => {
  try {
    await connectDB();

    const data = await repo.get();

    return ok(data);
  } catch (err) {
    return fail(err);
  }
};

const deleteHandler = async (req) => {
  try {
    await connectDB();

    await repo.delete();

    auditLogger.log({
      action: "SOFT_SKILL_SECTION_DELETE",
      userId: req.user.userId,
    });

    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
};

const rateKey = (req) => `rate:${req.ip}:${req.method}:${req.nextUrl.pathname}`;

const get = DEV
  ? getHandler
  : withRateLimit(getHandler, { limit: 100, window: 60, key: rateKey });

const create = DEV
  ? withCsrf(authGuard(roleGuard(createHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(createHandler, ADMIN))), {
      limit: 10,
      window: 60,
      key: rateKey,
    });

const remove = DEV
  ? withCsrf(authGuard(roleGuard(deleteHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(deleteHandler, ADMIN))), {
      limit: 5,
      window: 60,
      key: rateKey,
    });

export async function GET(req) {
  return get(req);
}

export async function POST(req) {
  return create(req);
}

export async function DELETE(req) {
  return remove(req);
}
