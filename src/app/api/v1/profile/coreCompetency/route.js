import connectDB from "@/shared/lib/db";

import { withRateLimit } from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { UpsertCoreCompetencySectionUseCase } from "@/modules/profile/application/useCases/upsertCoreCompetencySection.usecase";
import { AddCoreCompetencyItemUseCase } from "@/modules/profile/application/useCases/addCoreCompetency.usecase";
import { DeleteCoreCompetencyUseCase } from "@/modules/profile/application/useCases/deleteCoreCompetency.usecase";

import { CoreCompetencyRepository } from "@/modules/profile/infrastructure/persistence/coreCompetency.repository";
import { ProfileRepository } from "@/modules/profile/infrastructure/persistence/profile.repository";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import { ValidationError } from "@/shared/errors";
import auditLogger from "@/shared/security/audit/audit.logger";

const repo = new CoreCompetencyRepository();
const profileRepo = new ProfileRepository();

const sectionUC = new UpsertCoreCompetencySectionUseCase(repo, profileRepo);
const itemUC = new AddCoreCompetencyItemUseCase(repo, profileRepo, null);
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
  console.error("🔥 CORE ERROR:", error);

  return Response.json(
    {
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    },
    { status: error.status || 500 },
  );
};

const createHandler = async (req) => {
  try {
    await connectDB();

    const raw = await safeJson(req);

    const result = await sectionUC.execute(raw, req.user);

    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const updateHandler = async (req) => {
  try {
    await connectDB();

    const raw = await safeJson(req);

    const result = await itemUC.execute(raw, req.user);

    return ok(result);
  } catch (err) {
    return fail(err);
  }
};

const getHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    const data = await repo.findByProfile(profileId);

    return ok(data);
  } catch (err) {
    return fail(err);
  }
};

const deleteHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    await deleteUC.execute(profileId);

    auditLogger.info("COMPETENCY_SECTION_DELETED", {
      actor: { userId: req.user.id, roles: req.user.roles },
      resource: { type: "CoreCompetency", profileId },
      meta: { requestId: req.user.requestId },
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

export async function PATCH(req) {
  return update(req);
}

export async function GET(req) {
  return get(req);
}

export async function DELETE(req) {
  return remove(req);
}
