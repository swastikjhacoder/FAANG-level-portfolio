import connectDB from "@/shared/lib/db";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";
import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

import { CoreCompetencySectionRepository } from "@/modules/profile/infrastructure/persistence/coreCompetencySection.repository";

import { GetCoreCompetencySectionUseCase } from "@/modules/profile/application/useCases/getCoreCompetencySection.usecase";
import { UpsertCoreCompetencySectionUseCase } from "@/modules/profile/application/useCases/upsertCoreCompetencySection.usecase";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";
import { ValidationError } from "@/shared/errors";
import auditLogger from "@/shared/security/audit/audit.logger";

const repo = new CoreCompetencySectionRepository();

const getUC = new GetCoreCompetencySectionUseCase(repo);
const upsertUC = new UpsertCoreCompetencySectionUseCase(repo, null);

const DEV = process.env.NODE_ENV === "development";
const ADMIN = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

const ok = (data) => Response.json({ success: true, data });

const fail = (error) =>
  Response.json(
    {
      success: false,
      message: error.message || "Internal Server Error",
      code: error.code || "INTERNAL_ERROR",
    },
    { status: error.status || 500 },
  );

const getHandler = async () => {
  try {
    await connectDB();
    const data = await getUC.execute();
    return ok(data);
  } catch (err) {
    return fail(err);
  }
};

const upsertHandler = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const sanitized = sanitizeInput(body);

    const existing = await repo.get();
    const version = existing?.version ?? undefined;

    const result = await upsertUC.execute(sanitized, req.user.userId, version);

    auditLogger.log({
      action: existing
        ? "CORE_COMPETENCY_SECTION_UPDATE"
        : "CORE_COMPETENCY_SECTION_CREATE",
      userId: req.user.userId,
      resourceId: result._id,
    });

    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const deleteHandler = async (req) => {
  try {
    await connectDB();

    const existing = await repo.get();
    if (!existing) {
      throw new ValidationError("Section not found");
    }

    await repo.softDelete();

    auditLogger.log({
      action: "CORE_COMPETENCY_SECTION_DELETE",
      userId: req.user.userId,
      resourceId: existing._id,
    });

    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
};

const upsert = DEV
  ? withCsrf(authGuard(roleGuard(upsertHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(upsertHandler, ADMIN))), {
      limit: 10,
      window: 60,
      key: (req) => `rate:${req.ip}:${req.method}:${req.nextUrl.pathname}`,
    });

const remove = DEV
  ? withCsrf(authGuard(roleGuard(deleteHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(deleteHandler, ADMIN))), {
      limit: 5,
      window: 60,
      key: (req) => `rate:${req.ip}:${req.method}:${req.nextUrl.pathname}`,
    });

const get = DEV
  ? getHandler
  : withRateLimit(getHandler, {
      limit: 100,
      window: 60,
      key: (req) => `rate:${req.ip}:${req.method}:${req.nextUrl.pathname}`,
    });

export async function GET(req) {
  return get(req);
}

export async function POST(req) {
  return upsert(req);
}

export async function PUT(req) {
  return upsert(req);
}

export async function DELETE(req) {
  return remove(req);
}
