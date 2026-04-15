import connectDB from "@/shared/lib/db";

import { withRateLimit } from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

import { AddCoreCompetencyUseCase } from "@/modules/profile/application/useCases/addCoreCompetency.usecase";
import { UpdateCoreCompetencyUseCase } from "@/modules/profile/application/useCases/updateCoreCompetency.usecase";
import { DeleteCoreCompetencyUseCase } from "@/modules/profile/application/useCases/deleteCoreCompetency.usecase";

import { CoreCompetencyRepository } from "@/modules/profile/infrastructure/persistence/coreCompetency.repository";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError } from "@/shared/errors";
import auditLogger from "@/shared/security/audit/audit.logger";
import { addCoreCompetencyDTO } from "@/modules/profile/application/dto/addCoreCompetency.dto";

const repo = new CoreCompetencyRepository();

const createUC = new AddCoreCompetencyUseCase(repo);
const updateUC = new UpdateCoreCompetencyUseCase(repo);
const deleteUC = new DeleteCoreCompetencyUseCase(repo);

const DEV = process.env.NODE_ENV === "development";
const ADMIN = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

const safeJson = async (req) => {
  try {
    return await req.json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }
};

const ok = (data) => Response.json({ success: true, data });

const fail = (error) => {
  console.error("🔥 FULL ERROR:", error);

  return Response.json(
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
};

const createHandler = async (req) => {
  console.log("🚀 CORE CREATE START");

  try {
    await connectDB();
    console.log("✅ DB connected");

    const raw = await req.json();
    console.log("📥 RAW:", raw);

    const sanitized = sanitizeInput(raw);
    console.log("🧹 SANITIZED:", sanitized);

    const validated = addCoreCompetencyDTO.parse(sanitized);
    console.log("✅ VALIDATED:", validated);

    validateObjectId(validated.profileId, "profileId");

    const result = await createUC.execute(validated, req.user);
    console.log("📦 RESULT:", result);

    return ok(result);
  } catch (err) {
    console.error("🔥 CORE CREATE ERROR:", err); // 👈 IMPORTANT
    return fail(err);
  }
};

const getHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    validateObjectId(profileId, "profileId");

    const data = await repo.findByProfile(profileId);

    return ok(data);
  } catch (err) {
    return fail(err);
  }
};

const updateHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("coreCompetencyId");

    validateObjectId(id, "coreCompetencyId");

    const raw = await safeJson(req);
    const sanitized = sanitizeInput(raw);

    const result = await updateUC.execute(id, sanitized, req.user);

    auditLogger.log({
      action: "COMPETENCY_UPDATE",
      userId: req.user.id,
      resourceId: id,
    });

    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const deleteHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("coreCompetencyId");

    validateObjectId(id, "coreCompetencyId");

    await deleteUC.execute(id);

    auditLogger.log({
      action: "COMPETENCY_DELETE",
      userId: req.user.id,
      resourceId: id,
    });

    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
};

const create = withRateLimit(
  withCsrf(authGuard(roleGuard(createHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 20, window: 60 },
);

const update = withRateLimit(
  withCsrf(authGuard(roleGuard(updateHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 20, window: 60 },
);

const remove = withRateLimit(
  withCsrf(authGuard(roleGuard(deleteHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 10, window: 60 },
);

const get = withRateLimit(getHandler, {
  limit: 100,
  window: 60,
});

export async function POST(req) {
  return create(req);
}

export async function GET(req) {
  return get(req);
}

export async function PATCH(req) {
  return update(req);
}

export async function DELETE(req) {
  return remove(req);
}
