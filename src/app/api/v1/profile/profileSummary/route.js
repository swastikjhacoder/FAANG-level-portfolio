import connectDB from "@/shared/lib/db";

import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";

import { AddProfileSummaryUseCase } from "@/modules/profile/application/useCases/addProfileSummary.usecase";
import { UpdateProfileSummaryUseCase } from "@/modules/profile/application/useCases/updateProfileSummary.usecase";
import { DeleteProfileSummaryUseCase } from "@/modules/profile/application/useCases/deleteProfileSummary.usecase";

import { ProfileSummaryRepository } from "@/modules/profile/infrastructure/persistence/profileSummary.repository";

import { authGuard } from "@/modules/auth/security/guards/auth.guard";
import { roleGuard } from "@/modules/auth/security/guards/role.guard";

import { ROLES } from "@/shared/constants/roles";

import { validateObjectId } from "@/shared/utils/validateObjectId";
import { ValidationError } from "@/shared/errors";
import auditLogger from "@/shared/security/audit/audit.logger";

const repo = new ProfileSummaryRepository();

const createUC = new AddProfileSummaryUseCase(repo);
const updateUC = new UpdateProfileSummaryUseCase(repo);
const deleteUC = new DeleteProfileSummaryUseCase(repo);

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
  console.error("🔥 PROFILE SUMMARY UPDATE ERROR:", error);

  return Response.json(
    {
      success: false,
      message:
        error?.code === "BAD_USER_INPUT"
          ? error.message
          : error?.message || "Internal Server Error",
      code: error.code || "INTERNAL_ERROR",
    },
    { status: error.status || 500 },
  );
};

const createHandler = async (req) => {
  try {
    await connectDB();

    const raw = await safeJson(req);
    const sanitized = sanitizeInput(raw);

    const payload = {
      ...sanitized,
      profileId: req.user.userId,
    };

    const result = await createUC.execute(payload, req.user);

    auditLogger.log({
      action: "SUMMARY_CREATE",
      userId: req.user.userId,
      resourceId: result._id,
    });

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
    const id = searchParams.get("profileSummaryId");

    validateObjectId(id, "profileSummaryId");

    const raw = await safeJson(req);
    const sanitized = sanitizeInput(raw);

    const result = await updateUC.execute(id, sanitized, req.user);

    auditLogger.log({
      action: "SUMMARY_UPDATE",
      userId: req.user.userId,
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
    const id = searchParams.get("profileSummaryId");

    validateObjectId(id, "profileSummaryId");

    await deleteUC.execute(id);

    auditLogger.log({
      action: "SUMMARY_DELETE",
      userId: req.user.userId,
      resourceId: id,
    });

    return ok({ success: true });
  } catch (err) {
    return fail(err);
  }
};

const create = DEV
  ? withCsrf(authGuard(roleGuard(createHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(createHandler, ADMIN))), {
      limit: 10,
      window: 60,
      key: (req) => `rate:${req.ip}:${req.method}:${req.nextUrl.pathname}`,
    });

const update = DEV
  ? withCsrf(authGuard(roleGuard(updateHandler, ADMIN)))
  : withRateLimit(withCsrf(authGuard(roleGuard(updateHandler, ADMIN))), {
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
