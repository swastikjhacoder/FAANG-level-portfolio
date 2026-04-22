import connectDB from "@/shared/lib/db";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { CoreCompetencyRepository } from "@/modules/profile/infrastructure/persistence/coreCompetency.repository";
import { ProfileRepository } from "@/modules/profile/infrastructure/persistence/profile.repository";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import { ValidationError } from "@/shared/errors";
import auditLogger from "@/shared/security/audit/audit.logger";
import { validateObjectId } from "@/shared/utils/validateObjectId";
import { UpsertCoreCompetencyUseCase } from "@/modules/profile/application/useCases/upsertCoreCompetency.usecase";

const repo = new CoreCompetencyRepository();
const profileRepo = new ProfileRepository();

const upsertUC = new UpsertCoreCompetencyUseCase(repo, profileRepo, null);

const DEV = process.env.NODE_ENV === "development";
const ADMIN = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

const parseBody = async (req) => {
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
      code: error.code || "INTERNAL_ERROR",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    },
    { status: error.status || 500 },
  );
};

const upsertHandler = async (req) => {
  try {
    await connectDB();

    const raw = await parseBody(req);

    if (!raw.profileId) {
      throw new ValidationError("profileId is required");
    }

    validateObjectId(raw.profileId, "profileId");

    if (!Array.isArray(raw.items) || raw.items.length === 0) {
      throw new ValidationError("items must be a non-empty array");
    }

    const result = await upsertUC.execute(raw, req.user);

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

    if (!profileId) {
      throw new ValidationError("profileId is required");
    }

    validateObjectId(profileId, "profileId");

    const data = await repo.findByProfile(profileId);

    return ok(data || { items: [] });
  } catch (err) {
    return fail(err);
  }
};

const deleteHandler = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      throw new ValidationError("profileId is required");
    }

    validateObjectId(profileId, "profileId");

    await repo.softDelete(profileId);

    auditLogger.log({
      action: "COMPETENCY_DELETED",
      userId: req.user.userId,
      resourceId: profileId,
    });

    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
};

const upsert = withRateLimit(
  withCsrf(authGuard(roleGuard(upsertHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 20, window: 60 },
);

const remove = withRateLimit(
  withCsrf(authGuard(roleGuard(deleteHandler, ADMIN))),
  DEV ? { limit: 1000, window: 60 } : { limit: 10, window: 60 },
);

const get = withRateLimit(
  getHandler,
  DEV ? { limit: 1000, window: 60 } : { limit: 100, window: 60 },
);

export async function POST(req) {
  return upsert(req);
}

export async function PATCH(req) {
  return upsert(req);
}

export async function GET(req) {
  return get(req);
}

export async function DELETE(req) {
  return remove(req);
}
